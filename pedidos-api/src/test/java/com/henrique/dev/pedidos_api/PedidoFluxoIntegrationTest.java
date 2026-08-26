package com.henrique.dev.pedidos_api;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import com.henrique.dev.pedidos_api.auth.dto.AuthResponse;
import com.henrique.dev.pedidos_api.auth.dto.CadastroRequest;
import com.henrique.dev.pedidos_api.pedido.dto.AtualizarStatusRequest;
import com.henrique.dev.pedidos_api.pedido.dto.CriarPedidoRequest;
import com.henrique.dev.pedidos_api.pedido.dto.ItemPedidoRequest;
import com.henrique.dev.pedidos_api.pedido.dto.PedidoResponse;
import com.henrique.dev.pedidos_api.domain.StatusPedido;

/**
 * Exercita a pilha real (contexto Spring completo, seguranca, H2 em memoria
 * via application-test.properties) do cadastro ate o fim da vida de um
 * pedido, sem nenhum mock — e a rede de seguranca contra regressao de
 * integracao entre as camadas.
 */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
@ActiveProfiles("test")
class PedidoFluxoIntegrationTest {

	@LocalServerPort
	private int port;

	@Autowired
	private TestRestTemplate restTemplate;

	private String urlBase() {
		return "http://localhost:" + port;
	}

	@Test
	void fluxoCompletoDeCadastroLoginECicloDeVidaDoPedido() {
		String token = cadastrarERetornarToken("henrique");

		HttpHeaders headers = new HttpHeaders();
		headers.setBearerAuth(token);

		CriarPedidoRequest criarPedidoRequest = new CriarPedidoRequest(
				"Maria Silva",
				"Rua das Flores, 100",
				java.util.List.of(new ItemPedidoRequest("X-Burger", 2)));

		ResponseEntity<PedidoResponse> criado = restTemplate.exchange(
				urlBase() + "/api/pedidos",
				HttpMethod.POST,
				new HttpEntity<>(criarPedidoRequest, headers),
				PedidoResponse.class);
		assertThat(criado.getStatusCode()).isEqualTo(HttpStatus.CREATED);
		assertThat(criado.getBody().status()).isEqualTo(StatusPedido.RECEBIDO);
		Long pedidoId = criado.getBody().id();
		assertThat(pedidoId).isNotNull();

		assertThat(listarIds(headers)).contains(pedidoId);

		avancarStatus(pedidoId, headers, StatusPedido.EM_PREPARO, HttpStatus.OK);
		avancarStatus(pedidoId, headers, StatusPedido.SAIU_PARA_ENTREGA, HttpStatus.OK);
		avancarStatus(pedidoId, headers, StatusPedido.ENTREGUE, HttpStatus.OK);

		avancarStatus(pedidoId, headers, StatusPedido.RECEBIDO, HttpStatus.BAD_REQUEST);

		// Usuario anonimo (padrao do Spring Security) -> AccessDeniedException -> 403.
		ResponseEntity<String> semToken = restTemplate.getForEntity(urlBase() + "/api/pedidos", String.class);
		assertThat(semToken.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
	}

	@Test
	void usuarioNaoDeveVerNemAlterarPedidoDeOutroUsuario() {
		String tokenUsuarioA = cadastrarERetornarToken("usuario-a");
		HttpHeaders headersA = new HttpHeaders();
		headersA.setBearerAuth(tokenUsuarioA);

		CriarPedidoRequest criarPedidoRequest = new CriarPedidoRequest(
				"Cliente do Usuario A",
				"Rua A, 1",
				java.util.List.of(new ItemPedidoRequest("Item", 1)));
		ResponseEntity<PedidoResponse> criado = restTemplate.exchange(
				urlBase() + "/api/pedidos",
				HttpMethod.POST,
				new HttpEntity<>(criarPedidoRequest, headersA),
				PedidoResponse.class);
		Long pedidoDoUsuarioA = criado.getBody().id();

		String tokenUsuarioB = cadastrarERetornarToken("usuario-b");
		HttpHeaders headersB = new HttpHeaders();
		headersB.setBearerAuth(tokenUsuarioB);

		ResponseEntity<String> buscaCruzada = restTemplate.exchange(
				urlBase() + "/api/pedidos/" + pedidoDoUsuarioA,
				HttpMethod.GET,
				new HttpEntity<>(headersB),
				String.class);
		assertThat(buscaCruzada.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);

		assertThat(listarIds(headersB)).doesNotContain(pedidoDoUsuarioA);

		ResponseEntity<String> statusCruzado = restTemplate.exchange(
				urlBase() + "/api/pedidos/" + pedidoDoUsuarioA + "/status",
				HttpMethod.PUT,
				new HttpEntity<>(new AtualizarStatusRequest(StatusPedido.EM_PREPARO), headersB),
				String.class);
		assertThat(statusCruzado.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
	}

	@Test
	void tokenDeveSerRejeitadoAposLogout() {
		String token = cadastrarERetornarToken("logout");
		HttpHeaders headers = new HttpHeaders();
		headers.setBearerAuth(token);

		ResponseEntity<Void> logout = restTemplate.exchange(
				urlBase() + "/api/auth/logout",
				HttpMethod.POST,
				new HttpEntity<>(headers),
				Void.class);
		assertThat(logout.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

		// Mesmo token, mesma pilha de seguranca do usuario anonimo -> 403.
		ResponseEntity<String> aposLogout = restTemplate.exchange(
				urlBase() + "/api/pedidos",
				HttpMethod.GET,
				new HttpEntity<>(headers),
				String.class);
		assertThat(aposLogout.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
	}

	@SuppressWarnings("unchecked")
	private List<Long> listarIds(HttpHeaders headers) {
		// GET /api/pedidos retorna uma Page (paginacao) — desserializa como Map
		// generico e extrai "content" pra nao depender de um record espelhando
		// todos os campos que o Spring Data injeta no JSON de paginacao.
		ResponseEntity<Map> resposta = restTemplate.exchange(
				urlBase() + "/api/pedidos",
				HttpMethod.GET,
				new HttpEntity<>(headers),
				Map.class);
		List<Map<String, Object>> content = (List<Map<String, Object>>) resposta.getBody().get("content");
		return content.stream().map(item -> ((Number) item.get("id")).longValue()).toList();
	}

	private String cadastrarERetornarToken(String prefixo) {
		String email = prefixo + "+" + System.nanoTime() + "@email.com";

		ResponseEntity<AuthResponse> cadastro = restTemplate.postForEntity(
				urlBase() + "/api/auth/cadastro",
				new CadastroRequest("Usuario Teste", email, "123456"),
				AuthResponse.class);
		assertThat(cadastro.getStatusCode()).isEqualTo(HttpStatus.CREATED);
		String token = cadastro.getBody().token();
		assertThat(token).isNotBlank();
		return token;
	}

	private void avancarStatus(Long pedidoId, HttpHeaders headers, StatusPedido novoStatus, HttpStatus statusEsperado) {
		// Usa String.class (nao PedidoResponse.class) porque no caso de transicao
		// invalida o corpo e o JSON de erro do GlobalExceptionHandler, com formato
		// diferente do PedidoResponse — so o status HTTP importa aqui.
		ResponseEntity<String> resposta = restTemplate.exchange(
				urlBase() + "/api/pedidos/" + pedidoId + "/status",
				HttpMethod.PUT,
				new HttpEntity<>(new AtualizarStatusRequest(novoStatus), headers),
				String.class);
		assertThat(resposta.getStatusCode()).isEqualTo(statusEsperado);
	}
}
