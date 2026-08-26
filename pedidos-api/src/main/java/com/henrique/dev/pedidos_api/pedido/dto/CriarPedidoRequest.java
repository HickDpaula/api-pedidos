package com.henrique.dev.pedidos_api.pedido.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public record CriarPedidoRequest(
		@NotBlank(message = "Cliente é obrigatório")
		@Size(max = 150, message = "Cliente deve ter no máximo 150 caracteres")
		String cliente,

		@NotBlank(message = "Endereço de entrega é obrigatório")
		@Size(max = 255, message = "Endereço de entrega deve ter no máximo 255 caracteres")
		String enderecoEntrega,

		@NotEmpty(message = "Pedido deve ter ao menos um item")
		@Valid
		List<ItemPedidoRequest> itens) {
}
