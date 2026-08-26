package com.henrique.dev.pedidos_api.security;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class LoginRateLimiterTest {

	private final LoginRateLimiter rateLimiter = new LoginRateLimiter();

	@Test
	void naoDeveBloquearAntesDeAtingirOLimite() {
		String email = "henrique@email.com";

		for (int i = 0; i < 4; i++) {
			rateLimiter.registrarFalha(email);
		}

		assertThatCode(() -> rateLimiter.verificarLimite(email)).doesNotThrowAnyException();
	}

	@Test
	void deveBloquearAoAtingirOLimite() {
		String email = "henrique@email.com";

		for (int i = 0; i < 5; i++) {
			rateLimiter.registrarFalha(email);
		}

		assertThatThrownBy(() -> rateLimiter.verificarLimite(email))
				.isInstanceOf(ResponseStatusException.class)
				.extracting(ex -> ((ResponseStatusException) ex).getStatusCode())
				.isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
	}

	@Test
	void sucessoDeveZerarOContador() {
		String email = "henrique@email.com";

		for (int i = 0; i < 5; i++) {
			rateLimiter.registrarFalha(email);
		}
		rateLimiter.registrarSucesso(email);

		assertThatCode(() -> rateLimiter.verificarLimite(email)).doesNotThrowAnyException();
	}

	@Test
	void emailsDiferentesTemContadoresIndependentes() {
		for (int i = 0; i < 5; i++) {
			rateLimiter.registrarFalha("henrique@email.com");
		}

		assertThatCode(() -> rateLimiter.verificarLimite("outro@email.com")).doesNotThrowAnyException();
	}
}
