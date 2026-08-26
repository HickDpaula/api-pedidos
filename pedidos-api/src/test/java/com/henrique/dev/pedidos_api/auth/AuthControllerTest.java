package com.henrique.dev.pedidos_api.auth;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.henrique.dev.pedidos_api.auth.dto.AuthResponse;
import com.henrique.dev.pedidos_api.auth.dto.CadastroRequest;
import com.henrique.dev.pedidos_api.auth.dto.LoginRequest;
import com.henrique.dev.pedidos_api.security.JwtService;
import com.henrique.dev.pedidos_api.security.SecurityConfig;
import com.henrique.dev.pedidos_api.security.TokenBlacklistService;
import com.henrique.dev.pedidos_api.security.UsuarioDetailsService;

/**
 * /api/auth/** e publico (SecurityConfig.permitAll), entao nao precisamos
 * simular token aqui — so importamos SecurityConfig porque ela define os
 * beans (PasswordEncoder, AuthenticationManager) que o contexto do slice
 * precisa para inicializar.
 */
@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
class AuthControllerTest {

	@Autowired
	private MockMvc mockMvc;

	private final ObjectMapper objectMapper = new ObjectMapper();

	@MockitoBean
	private AuthService authService;

	@MockitoBean
	private JwtService jwtService;

	@MockitoBean
	private UsuarioDetailsService usuarioDetailsService;

	@MockitoBean
	private TokenBlacklistService tokenBlacklistService;

	@Test
	void cadastroComNomeEmBrancoDeveRetornar400() throws Exception {
		CadastroRequest request = new CadastroRequest("", "henrique@email.com", "123456");

		mockMvc.perform(post("/api/auth/cadastro")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.campos.nome").exists());
	}

	@Test
	void cadastroComEmailInvalidoDeveRetornar400() throws Exception {
		CadastroRequest request = new CadastroRequest("Henrique", "nao-e-email", "123456");

		mockMvc.perform(post("/api/auth/cadastro")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.campos.email").exists());
	}

	@Test
	void cadastroComSenhaCurtaDeveRetornar400() throws Exception {
		CadastroRequest request = new CadastroRequest("Henrique", "henrique@email.com", "123");

		mockMvc.perform(post("/api/auth/cadastro")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.campos.senha").exists());
	}

	@Test
	void cadastroComDadosValidosDeveRetornar201() throws Exception {
		CadastroRequest request = new CadastroRequest("Henrique", "henrique@email.com", "123456");
		when(authService.cadastrar(any(CadastroRequest.class)))
				.thenReturn(new AuthResponse("token", "Bearer", 1L, "Henrique", "henrique@email.com"));

		mockMvc.perform(post("/api/auth/cadastro")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.token").value("token"));
	}

	@Test
	void cadastroComEmailDuplicadoDeveRetornar409() throws Exception {
		CadastroRequest request = new CadastroRequest("Henrique", "henrique@email.com", "123456");
		when(authService.cadastrar(any(CadastroRequest.class)))
				.thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado"));

		mockMvc.perform(post("/api/auth/cadastro")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isConflict());
	}

	@Test
	void loginComCredenciaisValidasDeveRetornar200() throws Exception {
		LoginRequest request = new LoginRequest("henrique@email.com", "123456");
		when(authService.login(any(LoginRequest.class)))
				.thenReturn(new AuthResponse("token", "Bearer", 1L, "Henrique", "henrique@email.com"));

		mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.tipo").value("Bearer"));
	}

	@Test
	void loginComCredenciaisInvalidasDeveRetornar401() throws Exception {
		LoginRequest request = new LoginRequest("henrique@email.com", "senha-errada");
		when(authService.login(any(LoginRequest.class)))
				.thenThrow(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos"));

		mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.erro").value("E-mail ou senha inválidos"));
	}

	@Test
	void loginComMuitasTentativasDeveRetornar429() throws Exception {
		LoginRequest request = new LoginRequest("henrique@email.com", "senha-errada");
		when(authService.login(any(LoginRequest.class)))
				.thenThrow(new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Muitas tentativas de login. Tente novamente em alguns minutos."));

		mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isTooManyRequests());
	}

	@Test
	void logoutComTokenDeveRetornar204EChamarAuthService() throws Exception {
		mockMvc.perform(post("/api/auth/logout").header("Authorization", "Bearer token-valido"))
				.andExpect(status().isNoContent());

		verify(authService).logout("token-valido");
	}
}
