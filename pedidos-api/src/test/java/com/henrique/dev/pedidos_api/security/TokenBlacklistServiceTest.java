package com.henrique.dev.pedidos_api.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Date;

import org.junit.jupiter.api.Test;

class TokenBlacklistServiceTest {

	private final TokenBlacklistService blacklist = new TokenBlacklistService();

	@Test
	void tokenNuncaRevogadoNaoEstaRevogado() {
		assertThat(blacklist.estaRevogado("token-qualquer")).isFalse();
	}

	@Test
	void tokenRevogadoComExpiracaoFuturaEstaRevogado() {
		Date expiracaoFutura = new Date(System.currentTimeMillis() + 60_000);

		blacklist.revogar("token-a", expiracaoFutura);

		assertThat(blacklist.estaRevogado("token-a")).isTrue();
	}

	@Test
	void tokenComExpiracaoJaPassadaNaoContaComoRevogado() {
		// Se o token ja expirou naturalmente, nao precisa mais da blacklist —
		// tokenValido() do JwtService ja rejeitaria ele de qualquer forma.
		Date expiracaoPassada = new Date(System.currentTimeMillis() - 60_000);

		blacklist.revogar("token-b", expiracaoPassada);

		assertThat(blacklist.estaRevogado("token-b")).isFalse();
	}
}
