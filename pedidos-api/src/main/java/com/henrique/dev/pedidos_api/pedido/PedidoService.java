package com.henrique.dev.pedidos_api.pedido;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.henrique.dev.pedidos_api.domain.ItemPedido;
import com.henrique.dev.pedidos_api.domain.Pedido;
import com.henrique.dev.pedidos_api.domain.StatusPedido;
import com.henrique.dev.pedidos_api.domain.Usuario;
import com.henrique.dev.pedidos_api.pedido.dto.AtualizarStatusRequest;
import com.henrique.dev.pedidos_api.pedido.dto.CriarPedidoRequest;
import com.henrique.dev.pedidos_api.pedido.dto.ItemPedidoRequest;
import com.henrique.dev.pedidos_api.pedido.dto.PedidoResponse;
import com.henrique.dev.pedidos_api.repository.PedidoRepository;

@Service
public class PedidoService {

	private static final Map<StatusPedido, Set<StatusPedido>> TRANSICOES_PERMITIDAS = new EnumMap<>(StatusPedido.class);

	static {
		TRANSICOES_PERMITIDAS.put(StatusPedido.RECEBIDO, EnumSet.of(StatusPedido.EM_PREPARO, StatusPedido.CANCELADO));
		TRANSICOES_PERMITIDAS.put(StatusPedido.EM_PREPARO, EnumSet.of(StatusPedido.SAIU_PARA_ENTREGA, StatusPedido.CANCELADO));
		TRANSICOES_PERMITIDAS.put(StatusPedido.SAIU_PARA_ENTREGA, EnumSet.of(StatusPedido.ENTREGUE, StatusPedido.CANCELADO));
		TRANSICOES_PERMITIDAS.put(StatusPedido.ENTREGUE, EnumSet.noneOf(StatusPedido.class));
		TRANSICOES_PERMITIDAS.put(StatusPedido.CANCELADO, EnumSet.noneOf(StatusPedido.class));
	}

	private final PedidoRepository pedidoRepository;

	public PedidoService(PedidoRepository pedidoRepository) {
		this.pedidoRepository = pedidoRepository;
	}

	@Transactional
	public PedidoResponse criar(CriarPedidoRequest request, Usuario usuario) {
		Pedido pedido = new Pedido();
		pedido.setCliente(request.cliente().trim());
		pedido.setEnderecoEntrega(request.enderecoEntrega().trim());
		pedido.setUsuario(usuario);
		pedido.setStatus(StatusPedido.RECEBIDO);

		for (ItemPedidoRequest itemRequest : request.itens()) {
			ItemPedido item = new ItemPedido();
			item.setNome(itemRequest.nome().trim());
			item.setQuantidade(itemRequest.quantidade());
			pedido.adicionarItem(item);
		}

		Pedido salvo = pedidoRepository.save(pedido);
		return PedidoResponse.from(salvo);
	}

	@Transactional(readOnly = true)
	public Page<PedidoResponse> listarTodos(Usuario usuario, Pageable pageable) {
		return pedidoRepository.findByUsuario(usuario, pageable).map(PedidoResponse::from);
	}

	@Transactional(readOnly = true)
	public PedidoResponse buscarPorId(Long id, Usuario usuario) {
		return PedidoResponse.from(buscarPedido(id, usuario));
	}

	@Transactional
	public PedidoResponse atualizarStatus(Long id, Usuario usuario, AtualizarStatusRequest request) {
		Pedido pedido = buscarPedido(id, usuario);
		StatusPedido statusAtual = pedido.getStatus();
		StatusPedido novoStatus = request.status();

		if (statusAtual == novoStatus) {
			return PedidoResponse.from(pedido);
		}

		Set<StatusPedido> permitidos = TRANSICOES_PERMITIDAS.getOrDefault(statusAtual, EnumSet.noneOf(StatusPedido.class));
		if (!permitidos.contains(novoStatus)) {
			throw new ResponseStatusException(
					HttpStatus.BAD_REQUEST,
					"Não é permitido alterar o status de "
							+ statusAtual.getLabel()
							+ " para "
							+ novoStatus.getLabel());
		}

		pedido.setStatus(novoStatus);
		return PedidoResponse.from(pedido);
	}

	private Pedido buscarPedido(Long id, Usuario usuario) {
		return pedidoRepository.findByIdAndUsuario(id, usuario)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado"));
	}
}
