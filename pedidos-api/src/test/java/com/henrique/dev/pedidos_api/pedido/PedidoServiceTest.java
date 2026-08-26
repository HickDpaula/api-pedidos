package com.henrique.dev.pedidos_api.pedido;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.henrique.dev.pedidos_api.domain.Pedido;
import com.henrique.dev.pedidos_api.domain.StatusPedido;
import com.henrique.dev.pedidos_api.pedido.dto.AtualizarStatusRequest;
import com.henrique.dev.pedidos_api.pedido.dto.CriarPedidoRequest;
import com.henrique.dev.pedidos_api.pedido.dto.ItemPedidoRequest;
import com.henrique.dev.pedidos_api.pedido.dto.PedidoResponse;
import com.henrique.dev.pedidos_api.repository.PedidoRepository;

/**
 * Espelha PedidoService.TRANSICOES_PERMITIDAS. Se o mapa do backend mudar, os
 * testes parametrizados aqui precisam mudar junto (é o guardião da regra de
 * negocio central do projeto).
 */
@ExtendWith(MockitoExtension.class)
class PedidoServiceTest {

	private static final Map<StatusPedido, Set<StatusPedido>> TRANSICOES_VALIDAS = new EnumMap<>(StatusPedido.class);

	static {
		TRANSICOES_VALIDAS.put(StatusPedido.RECEBIDO, EnumSet.of(StatusPedido.EM_PREPARO, StatusPedido.CANCELADO));
		TRANSICOES_VALIDAS.put(StatusPedido.EM_PREPARO, EnumSet.of(StatusPedido.SAIU_PARA_ENTREGA, StatusPedido.CANCELADO));
		TRANSICOES_VALIDAS.put(StatusPedido.SAIU_PARA_ENTREGA, EnumSet.of(StatusPedido.ENTREGUE, StatusPedido.CANCELADO));
		TRANSICOES_VALIDAS.put(StatusPedido.ENTREGUE, EnumSet.noneOf(StatusPedido.class));
		TRANSICOES_VALIDAS.put(StatusPedido.CANCELADO, EnumSet.noneOf(StatusPedido.class));
	}

	@Mock
	private PedidoRepository pedidoRepository;

	@InjectMocks
	private PedidoService pedidoService;

	private static Stream<Arguments> transicoesValidas() {
		return TRANSICOES_VALIDAS.entrySet().stream()
				.flatMap(entry -> entry.getValue().stream()
						.map(destino -> Arguments.of(entry.getKey(), destino)));
	}

	private static Stream<Arguments> transicoesInvalidas() {
		return Arrays.stream(StatusPedido.values())
				.flatMap(origem -> Arrays.stream(StatusPedido.values())
						.filter(destino -> destino != origem)
						.filter(destino -> !TRANSICOES_VALIDAS.get(origem).contains(destino))
						.map(destino -> Arguments.of(origem, destino)));
	}

	@ParameterizedTest(name = "{0} -> {1} deve ser permitido")
	@MethodSource("transicoesValidas")
	void devePermitirTransicaoValida(StatusPedido origem, StatusPedido destino) {
		Pedido pedido = criarPedido(1L, origem);
		when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

		PedidoResponse response = pedidoService.atualizarStatus(1L, new AtualizarStatusRequest(destino));

		assertThat(response.status()).isEqualTo(destino);
	}

	@ParameterizedTest(name = "{0} -> {1} deve ser rejeitado")
	@MethodSource("transicoesInvalidas")
	void naoDevePermitirTransicaoInvalida(StatusPedido origem, StatusPedido destino) {
		Pedido pedido = criarPedido(1L, origem);
		when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

		assertThatThrownBy(() -> pedidoService.atualizarStatus(1L, new AtualizarStatusRequest(destino)))
				.isInstanceOf(ResponseStatusException.class)
				.extracting(ex -> ((ResponseStatusException) ex).getStatusCode())
				.isEqualTo(HttpStatus.BAD_REQUEST);
	}

	@Test
	void atualizarParaMesmoStatusDeveSerNoOp() {
		Pedido pedido = criarPedido(1L, StatusPedido.EM_PREPARO);
		when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

		PedidoResponse response = pedidoService.atualizarStatus(1L, new AtualizarStatusRequest(StatusPedido.EM_PREPARO));

		assertThat(response.status()).isEqualTo(StatusPedido.EM_PREPARO);
	}

	@Test
	void deveLancar404AoAtualizarStatusDePedidoInexistente() {
		when(pedidoRepository.findById(99L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> pedidoService.atualizarStatus(99L, new AtualizarStatusRequest(StatusPedido.EM_PREPARO)))
				.isInstanceOf(ResponseStatusException.class)
				.extracting(ex -> ((ResponseStatusException) ex).getStatusCode())
				.isEqualTo(HttpStatus.NOT_FOUND);
	}

	@Test
	void deveLancar404AoBuscarPedidoInexistente() {
		when(pedidoRepository.findById(99L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> pedidoService.buscarPorId(99L))
				.isInstanceOf(ResponseStatusException.class)
				.extracting(ex -> ((ResponseStatusException) ex).getStatusCode())
				.isEqualTo(HttpStatus.NOT_FOUND);
	}

	@Test
	void deveCriarPedidoComStatusRecebidoEItensAssociados() {
		when(pedidoRepository.save(any(Pedido.class))).thenAnswer(invocation -> {
			Pedido pedido = invocation.getArgument(0);
			pedido.setId(10L);
			return pedido;
		});

		CriarPedidoRequest request = new CriarPedidoRequest(
				"  Maria Silva  ",
				"  Rua das Flores, 100  ",
				List.of(new ItemPedidoRequest("X-Burger", 2)));

		PedidoResponse response = pedidoService.criar(request);

		assertThat(response.cliente()).isEqualTo("Maria Silva");
		assertThat(response.enderecoEntrega()).isEqualTo("Rua das Flores, 100");
		assertThat(response.status()).isEqualTo(StatusPedido.RECEBIDO);
		assertThat(response.itens()).hasSize(1);
		verify(pedidoRepository).save(any(Pedido.class));
	}

	private Pedido criarPedido(Long id, StatusPedido status) {
		Pedido pedido = new Pedido();
		pedido.setId(id);
		pedido.setCliente("Cliente Teste");
		pedido.setEnderecoEntrega("Endereco Teste");
		pedido.setStatus(status);
		return pedido;
	}
}
