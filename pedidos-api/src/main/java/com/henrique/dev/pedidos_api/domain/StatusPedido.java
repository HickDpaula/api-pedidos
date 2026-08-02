package com.henrique.dev.pedidos_api.domain;

public enum StatusPedido {
	RECEBIDO("Recebido"),
	EM_PREPARO("Em preparo"),
	SAIU_PARA_ENTREGA("Saiu para entrega"),
	ENTREGUE("Entregue"),
	CANCELADO("Cancelado");

	private final String label;

	StatusPedido(String label) {
		this.label = label;
	}

	public String getLabel() {
		return label;
	}
}
