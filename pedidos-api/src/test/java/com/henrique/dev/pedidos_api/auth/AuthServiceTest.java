package com.henrique.dev.pedidos_api.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import com.henrique.dev.pedidos_api.auth.dto.AuthResponse;
import com.henrique.dev.pedidos_api.auth.dto.CadastroRequest;
import com.henrique.dev.pedidos_api.auth.dto.LoginRequest;
import com.henrique.dev.pedidos_api.domain.Usuario;
import com.henrique.dev.pedidos_api.repository.UsuarioRepository;
import com.henrique.dev.pedidos_api.security.JwtService;
import com.henrique.dev.pedidos_api.security.UsuarioDetails;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

	@Mock
	private UsuarioRepository usuarioRepository;

	@Mock
	private PasswordEncoder passwordEncoder;

	@Mock
	private JwtService jwtService;

	@Mock
	private AuthenticationManager authenticationManager;

	@InjectMocks
	private AuthService authService;

	@Test
	void deveCadastrarNovoUsuarioEGerarToken() {
		CadastroRequest request = new CadastroRequest("Henrique", "henrique@email.com", "123456");

		when(usuarioRepository.existsByEmail("henrique@email.com")).thenReturn(false);
		when(passwordEncoder.encode("123456")).thenReturn("hash");
		when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> {
			Usuario usuario = invocation.getArgument(0);
			usuario.setId(1L);
			return usuario;
		});
		when(jwtService.gerarToken("henrique@email.com")).thenReturn("token-gerado");

		AuthResponse response = authService.cadastrar(request);

		assertThat(response.token()).isEqualTo("token-gerado");
		assertThat(response.email()).isEqualTo("henrique@email.com");
		assertThat(response.nome()).isEqualTo("Henrique");
		assertThat(response.tipo()).isEqualTo("Bearer");
	}

	@Test
	void deveNormalizarEmailAntesDeChecarDuplicidade() {
		// Regressao: existsByEmail() era chamado com o valor cru do request, mas o
		// e-mail e salvo em minusculas — "Henrique@Email.com" passava pela checagem
		// como se fosse diferente de um "henrique@email.com" ja cadastrado.
		CadastroRequest request = new CadastroRequest("Henrique", "Henrique@Email.com", "123456");

		when(usuarioRepository.existsByEmail("henrique@email.com")).thenReturn(false);
		when(passwordEncoder.encode("123456")).thenReturn("hash");
		when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> {
			Usuario usuario = invocation.getArgument(0);
			usuario.setId(1L);
			return usuario;
		});
		when(jwtService.gerarToken("henrique@email.com")).thenReturn("token-gerado");

		authService.cadastrar(request);

		verify(usuarioRepository).existsByEmail("henrique@email.com");
	}

	@Test
	void deveLancar409QuandoEmailJaCadastrado() {
		CadastroRequest request = new CadastroRequest("Henrique", "henrique@email.com", "123456");
		when(usuarioRepository.existsByEmail("henrique@email.com")).thenReturn(true);

		assertThatThrownBy(() -> authService.cadastrar(request))
				.isInstanceOf(ResponseStatusException.class)
				.extracting(ex -> ((ResponseStatusException) ex).getStatusCode())
				.isEqualTo(HttpStatus.CONFLICT);
	}

	@Test
	void deveLogarEGerarTokenComCredenciaisValidas() {
		LoginRequest request = new LoginRequest("henrique@email.com", "123456");
		Usuario usuario = new Usuario();
		usuario.setId(1L);
		usuario.setNome("Henrique");
		usuario.setEmail("henrique@email.com");
		UsuarioDetails usuarioDetails = new UsuarioDetails(usuario);

		Authentication authentication = mock(Authentication.class);
		when(authentication.getPrincipal()).thenReturn(usuarioDetails);
		when(authenticationManager.authenticate(any())).thenReturn(authentication);
		when(jwtService.gerarToken("henrique@email.com")).thenReturn("token-gerado");

		AuthResponse response = authService.login(request);

		assertThat(response.token()).isEqualTo("token-gerado");
		assertThat(response.id()).isEqualTo(1L);
		assertThat(response.email()).isEqualTo("henrique@email.com");
	}

	@Test
	void deveLancar401ComCredenciaisInvalidas() {
		LoginRequest request = new LoginRequest("henrique@email.com", "senha-errada");
		when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("Credenciais invalidas"));

		assertThatThrownBy(() -> authService.login(request))
				.isInstanceOf(ResponseStatusException.class)
				.extracting(ex -> ((ResponseStatusException) ex).getStatusCode())
				.isEqualTo(HttpStatus.UNAUTHORIZED);
	}
}
