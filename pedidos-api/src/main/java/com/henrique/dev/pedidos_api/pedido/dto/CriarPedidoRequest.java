package com.henrique.dev.pedidos_api.pedido.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public record CriarPedidoRequest(
		@NotBlank(message = "Cliente é obrigatório")
		String cliente,

		@NotBlank(message = "Endereço de entrega é obrigatório")
		String enderecoEntrega,

		@NotEmpty(message = "Pedido deve ter ao menos um item")
		@Valid
		List<ItemPedidoRequest> itens) {
}
