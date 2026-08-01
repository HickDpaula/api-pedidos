package com.henrique.dev.pedidos_api.pedido.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.henrique.dev.pedidos_api.domain.Pedido;
import com.henrique.dev.pedidos_api.domain.StatusPedido;

public record PedidoResponse(
		Long id,
		String cliente,
		String enderecoEntrega,
		StatusPedido status,
		List<ItemPedidoResponse> itens,
		LocalDateTime criadoEm) {

	public static PedidoResponse from(Pedido pedido) {
		List<ItemPedidoResponse> itens = pedido.getItens().stream()
				.map(ItemPedidoResponse::from)
				.toList();

		return new PedidoResponse(
				pedido.getId(),
				pedido.getCliente(),
				pedido.getEnderecoEntrega(),
				pedido.getStatus(),
				itens,
				pedido.getCriadoEm());
	}
}
