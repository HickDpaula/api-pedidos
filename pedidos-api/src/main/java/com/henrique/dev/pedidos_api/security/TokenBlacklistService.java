package com.henrique.dev.pedidos_api.security;

import java.time.Instant;
import java.util.Date;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.springframework.stereotype.Component;

/**
 * Lista de revogacao de tokens em memoria — permite invalidar um JWT antes da
 * expiracao natural dele (ex: logout). Como o JWT em si e stateless, essa e a
 * unica forma de "derrubar" uma sessao sem trocar a chave de assinatura.
 * Guarda so ate a expiracao original do token, depois disso ele ja seria
 * invalido de qualquer forma — entao a limpeza e so por conveniencia de
 * memoria, feita de forma preguicosa a cada consulta/revogacao.
 */
@Component
public class TokenBlacklistService {

	private final ConcurrentMap<String, Instant> tokensRevogados = new ConcurrentHashMap<>();

	public void revogar(String token, Date expiracao) {
		limparExpirados();
		tokensRevogados.put(token, expiracao.toInstant());
	}

	public boolean estaRevogado(String token) {
		Instant expiracao = tokensRevogados.get(token);
		if (expiracao == null) {
			return false;
		}
		if (expiracao.isBefore(Instant.now())) {
			tokensRevogados.remove(token);
			return false;
		}
		return true;
	}

	private void limparExpirados() {
		Instant agora = Instant.now();
		tokensRevogados.entrySet().removeIf(entry -> entry.getValue().isBefore(agora));
	}
}
