package com.henrique.dev.pedidos_api.pedido.dto;

import com.henrique.dev.pedidos_api.domain.StatusPedido;

import jakarta.validation.constraints.NotNull;

public record AtualizarStatusRequest(
		@NotNull(message = "Status é obrigatório")
		StatusPedido status) {
}
