package com.henrique.dev.pedidos_api.pedido;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.henrique.dev.pedidos_api.domain.StatusPedido;
import com.henrique.dev.pedidos_api.domain.Usuario;
import com.henrique.dev.pedidos_api.pedido.dto.AtualizarStatusRequest;
import com.henrique.dev.pedidos_api.pedido.dto.CriarPedidoRequest;
import com.henrique.dev.pedidos_api.pedido.dto.ItemPedidoRequest;
import com.henrique.dev.pedidos_api.pedido.dto.ItemPedidoResponse;
import com.henrique.dev.pedidos_api.pedido.dto.PedidoResponse;
import com.henrique.dev.pedidos_api.security.JwtService;
import com.henrique.dev.pedidos_api.security.SecurityConfig;
import com.henrique.dev.pedidos_api.security.UsuarioDetails;
import com.henrique.dev.pedidos_api.security.UsuarioDetailsService;

/**
 * @Import(SecurityConfig.class) traz a config de seguranca real (o slice
 * @WebMvcTest sozinho nao carrega @Configuration arbitraria). JwtService e
 * UsuarioDetailsService sao mockados para simular um token valido sem
 * depender do banco.
 */
@WebMvcTest(PedidoController.class)
@Import(SecurityConfig.class)
class PedidoControllerTest {

	private static final String TOKEN = "token-valido";

	@Autowired
	private MockMvc mockMvc;

	private final ObjectMapper objectMapper = new ObjectMapper();

	@MockitoBean
	private PedidoService pedidoService;

	@MockitoBean
	private JwtService jwtService;

	@MockitoBean
	private UsuarioDetailsService usuarioDetailsService;

	@BeforeEach
	void autenticar() {
		Usuario usuario = new Usuario();
		usuario.setId(1L);
		usuario.setNome("Henrique");
		usuario.setEmail("henrique@email.com");
		usuario.setSenha("hash");

		when(jwtService.tokenValido(TOKEN)).thenReturn(true);
		when(jwtService.extrairEmail(TOKEN)).thenReturn("henrique@email.com");
		when(usuarioDetailsService.loadUserByUsername("henrique@email.com")).thenReturn(new UsuarioDetails(usuario));
	}

	private PedidoResponse pedidoResponseExemplo() {
		return new PedidoResponse(
				1L,
				"Maria Silva",
				"Rua das Flores, 100",
				StatusPedido.RECEBIDO,
				List.of(new ItemPedidoResponse(1L, "X-Burger", 2)),
				LocalDateTime.now());
	}

	@Test
	void listarSemTokenDeveRetornarErroDeAcessoNegado() throws Exception {
		// Com AnonymousAuthenticationFilter habilitado (padrao), uma requisicao sem
		// token vira um usuario anonimo autenticado, entao .authenticated() nega o
		// acesso via AccessDeniedException (403), nao AuthenticationException (401).
		mockMvc.perform(get("/api/pedidos"))
				.andExpect(status().isForbidden());
	}

	@Test
	void listarComTokenDeveRetornar200() throws Exception {
		when(pedidoService.listarTodos(any(Usuario.class))).thenReturn(List.of(pedidoResponseExemplo()));

		mockMvc.perform(get("/api/pedidos").header("Authorization", "Bearer " + TOKEN))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(jsonPath("$[0].cliente").value("Maria Silva"));
	}

	@Test
	void erroInesperadoDoServiceDeveRetornar500ComCorpoPadronizado() throws Exception {
		when(pedidoService.listarTodos(any(Usuario.class))).thenThrow(new RuntimeException("boom, detalhe interno sensivel"));

		mockMvc.perform(get("/api/pedidos").header("Authorization", "Bearer " + TOKEN))
				.andExpect(status().isInternalServerError())
				.andExpect(jsonPath("$.erro").value("Erro interno no servidor"))
				.andExpect(jsonPath("$.erro", not(containsString("detalhe interno sensivel"))));
	}

	@Test
	void buscarPorIdInexistenteDeveRetornar404() throws Exception {
		when(pedidoService.buscarPorId(eq(99L), any(Usuario.class)))
				.thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado"));

		mockMvc.perform(get("/api/pedidos/99").header("Authorization", "Bearer " + TOKEN))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.erro").value("Pedido não encontrado"));
	}

	@Test
	void criarComClienteEmBrancoDeveRetornar400() throws Exception {
		CriarPedidoRequest request = new CriarPedidoRequest("", "Rua A, 10", List.of(new ItemPedidoRequest("Pizza", 1)));

		mockMvc.perform(post("/api/pedidos")
						.header("Authorization", "Bearer " + TOKEN)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.campos.cliente").exists());
	}

	@Test
	void criarComItensVaziosDeveRetornar400() throws Exception {
		CriarPedidoRequest request = new CriarPedidoRequest("Maria", "Rua A, 10", List.of());

		mockMvc.perform(post("/api/pedidos")
						.header("Authorization", "Bearer " + TOKEN)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.campos.itens").exists());
	}

	@Test
	void criarComQuantidadeInvalidaDeveRetornar400() throws Exception {
		CriarPedidoRequest request = new CriarPedidoRequest("Maria", "Rua A, 10", List.of(new ItemPedidoRequest("Pizza", 0)));

		mockMvc.perform(post("/api/pedidos")
						.header("Authorization", "Bearer " + TOKEN)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isBadRequest());
	}

	@Test
	void criarComDadosValidosDeveRetornar201() throws Exception {
		CriarPedidoRequest request = new CriarPedidoRequest("Maria", "Rua A, 10", List.of(new ItemPedidoRequest("Pizza", 1)));
		when(pedidoService.criar(any(CriarPedidoRequest.class), any(Usuario.class))).thenReturn(pedidoResponseExemplo());

		mockMvc.perform(post("/api/pedidos")
						.header("Authorization", "Bearer " + TOKEN)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.cliente").value("Maria Silva"));
	}

	@Test
	void atualizarStatusSemStatusDeveRetornar400() throws Exception {
		mockMvc.perform(put("/api/pedidos/1/status")
						.header("Authorization", "Bearer " + TOKEN)
						.contentType(MediaType.APPLICATION_JSON)
						.content("{}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.campos.status").exists());
	}

	@Test
	void atualizarStatusComTransicaoInvalidaDeveRetornar400() throws Exception {
		when(pedidoService.atualizarStatus(eq(1L), any(Usuario.class), any(AtualizarStatusRequest.class)))
				.thenThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é permitido alterar o status"));

		mockMvc.perform(put("/api/pedidos/1/status")
						.header("Authorization", "Bearer " + TOKEN)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(new AtualizarStatusRequest(StatusPedido.ENTREGUE))))
				.andExpect(status().isBadRequest());
	}

	@Test
	void atualizarStatusValidoDeveRetornar200() throws Exception {
		PedidoResponse atualizado = new PedidoResponse(1L, "Maria Silva", "Rua das Flores, 100", StatusPedido.EM_PREPARO,
				List.of(), LocalDateTime.now());
		when(pedidoService.atualizarStatus(eq(1L), any(Usuario.class), any(AtualizarStatusRequest.class))).thenReturn(atualizado);

		mockMvc.perform(put("/api/pedidos/1/status")
						.header("Authorization", "Bearer " + TOKEN)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(new AtualizarStatusRequest(StatusPedido.EM_PREPARO))))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("EM_PREPARO"));
	}
}
