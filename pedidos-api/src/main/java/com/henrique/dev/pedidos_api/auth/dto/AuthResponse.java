package com.henrique.dev.pedidos_api.auth.dto;

public record AuthResponse(
		String token,
		String tipo,
		Long id,
		String nome,
		String email) {

	public static AuthResponse of(String token, Long id, String nome, String email) {
		return new AuthResponse(token, "Bearer", id, nome, email);
	}
}
