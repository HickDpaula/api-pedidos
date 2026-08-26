package com.henrique.dev.pedidos_api.security;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

/**
 * Limitador de tentativas de login em memoria, por e-mail. Adequado para uma
 * instancia unica (sem Redis/estado compartilhado) — se o app rodar
 * multi-instancia um dia, isso precisa virar um contador compartilhado.
 */
@Component
public class LoginRateLimiter {

	private static final int MAX_TENTATIVAS = 5;
	private static final Duration JANELA = Duration.ofMinutes(15);

	private final ConcurrentMap<String, Deque<Instant>> tentativasPorEmail = new ConcurrentHashMap<>();

	public void verificarLimite(String email) {
		Deque<Instant> tentativas = tentativasPorEmail.get(email);
		if (tentativas != null && contarTentativasRecentes(tentativas) >= MAX_TENTATIVAS) {
			throw new ResponseStatusException(
					HttpStatus.TOO_MANY_REQUESTS,
					"Muitas tentativas de login. Tente novamente em alguns minutos.");
		}
	}

	public void registrarFalha(String email) {
		Deque<Instant> tentativas = tentativasPorEmail.computeIfAbsent(email, key -> new ArrayDeque<>());
		synchronized (tentativas) {
			tentativas.addLast(Instant.now());
		}
	}

	public void registrarSucesso(String email) {
		tentativasPorEmail.remove(email);
	}

	private int contarTentativasRecentes(Deque<Instant> tentativas) {
		synchronized (tentativas) {
			Instant limite = Instant.now().minus(JANELA);
			tentativas.removeIf(instante -> instante.isBefore(limite));
			return tentativas.size();
		}
	}
}
