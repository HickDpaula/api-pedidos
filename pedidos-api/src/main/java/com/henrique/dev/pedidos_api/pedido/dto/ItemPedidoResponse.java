package com.henrique.dev.pedidos_api.pedido.dto;

import com.henrique.dev.pedidos_api.domain.ItemPedido;

public record ItemPedidoResponse(
		Long id,
		String nome,
		Integer quantidade) {

	public static ItemPedidoResponse from(ItemPedido item) {
		return new ItemPedidoResponse(item.getId(), item.getNome(), item.getQuantidade());
	}
}
