package com.henrique.dev.pedidos_api.auth;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.henrique.dev.pedidos_api.auth.dto.AuthResponse;
import com.henrique.dev.pedidos_api.auth.dto.CadastroRequest;
import com.henrique.dev.pedidos_api.auth.dto.LoginRequest;
import com.henrique.dev.pedidos_api.domain.Usuario;
import com.henrique.dev.pedidos_api.repository.UsuarioRepository;
import com.henrique.dev.pedidos_api.security.JwtService;
import com.henrique.dev.pedidos_api.security.UsuarioDetails;

@Service
public class AuthService {

	private final UsuarioRepository usuarioRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;
	private final AuthenticationManager authenticationManager;

	public AuthService(
			UsuarioRepository usuarioRepository,
			PasswordEncoder passwordEncoder,
			JwtService jwtService,
			AuthenticationManager authenticationManager) {
		this.usuarioRepository = usuarioRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
		this.authenticationManager = authenticationManager;
	}

	public AuthResponse cadastrar(CadastroRequest request) {
		String email = request.email().toLowerCase().trim();
		if (usuarioRepository.existsByEmail(email)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
		}

		Usuario usuario = new Usuario();
		usuario.setNome(request.nome());
		usuario.setEmail(email);
		usuario.setSenha(passwordEncoder.encode(request.senha()));

		Usuario salvo = usuarioRepository.save(usuario);
		String token = jwtService.gerarToken(salvo.getEmail());

		return AuthResponse.of(token, salvo.getId(), salvo.getNome(), salvo.getEmail());
	}

	public AuthResponse login(LoginRequest request) {
		try {
			Authentication authentication = authenticationManager.authenticate(
					new UsernamePasswordAuthenticationToken(
							request.email().toLowerCase().trim(),
							request.senha()));

			UsuarioDetails usuarioDetails = (UsuarioDetails) authentication.getPrincipal();
			Usuario usuario = usuarioDetails.getUsuario();
			String token = jwtService.gerarToken(usuario.getEmail());

			return AuthResponse.of(token, usuario.getId(), usuario.getNome(), usuario.getEmail());
		} catch (AuthenticationException ex) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos");
		}
	}
}
