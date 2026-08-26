package com.henrique.dev.pedidos_api.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

class JwtServiceTest {

	private static final String SECRET = "teste-chave-jwt-somente-para-testes-nao-usar-em-producao-nunca";

	private JwtService jwtService;

	@BeforeEach
	void setUp() {
		jwtService = new JwtService(SECRET, 3_600_000L);
	}

	@Test
	void deveGerarTokenEExtrairEmailCorretamente() {
		String token = jwtService.gerarToken("henrique@email.com");

		assertThat(token).isNotBlank();
		assertThat(jwtService.extrairEmail(token)).isEqualTo("henrique@email.com");
	}

	@Test
	void tokenReceemGeradoDeveSerValido() {
		String token = jwtService.gerarToken("henrique@email.com");

		assertThat(jwtService.tokenValido(token)).isTrue();
	}

	@Test
	void tokenMalformadoDeveSerInvalido() {
		assertThat(jwtService.tokenValido("token-completamente-invalido")).isFalse();
	}

	@Test
	void tokenComAssinaturaDeOutraChaveDeveSerInvalido() {
		JwtService outroServico = new JwtService("outra-chave-completamente-diferente-para-o-teste-1234567890", 3_600_000L);
		String token = outroServico.gerarToken("henrique@email.com");

		assertThat(jwtService.tokenValido(token)).isFalse();
	}

	@Test
	void tokenExpiradoDeveSerInvalido() {
		SecretKey chave = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
		Date emissao = new Date(System.currentTimeMillis() - 20_000);
		Date expiracao = new Date(System.currentTimeMillis() - 10_000);

		String tokenExpirado = Jwts.builder()
				.subject("henrique@email.com")
				.issuedAt(emissao)
				.expiration(expiracao)
				.signWith(chave)
				.compact();

		assertThat(jwtService.tokenValido(tokenExpirado)).isFalse();
	}
}
