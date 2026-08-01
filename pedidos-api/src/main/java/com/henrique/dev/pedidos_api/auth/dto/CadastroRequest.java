package com.henrique.dev.pedidos_api.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CadastroRequest(
		@NotBlank(message = "Nome é obrigatório")
		String nome,

		@NotBlank(message = "E-mail é obrigatório")
		@Email(message = "E-mail inválido")
		String email,

		@NotBlank(message = "Senha é obrigatória")
		@Size(min = 6, message = "Senha deve ter no mínimo 6 caracteres")
		String senha) {
}
