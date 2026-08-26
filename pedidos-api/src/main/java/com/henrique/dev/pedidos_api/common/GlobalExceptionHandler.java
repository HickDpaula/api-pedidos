package com.henrique.dev.pedidos_api.common;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

	private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
		Map<String, String> campos = new HashMap<>();
		for (FieldError error : ex.getBindingResult().getFieldErrors()) {
			campos.put(error.getField(), error.getDefaultMessage());
		}

		Map<String, Object> body = new HashMap<>();
		body.put("timestamp", Instant.now());
		body.put("status", HttpStatus.BAD_REQUEST.value());
		body.put("erro", "Dados inválidos");
		body.put("campos", campos);

		return ResponseEntity.badRequest().body(body);
	}

	@ExceptionHandler(AuthenticationException.class)
	public ResponseEntity<Map<String, Object>> handleAuthentication(AuthenticationException ex) {
		Map<String, Object> body = new HashMap<>();
		body.put("timestamp", Instant.now());
		body.put("status", HttpStatus.UNAUTHORIZED.value());
		body.put("erro", "E-mail ou senha inválidos");

		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
	}

	@ExceptionHandler(ResponseStatusException.class)
	public ResponseEntity<Map<String, Object>> handleResponseStatus(ResponseStatusException ex) {
		Map<String, Object> body = new HashMap<>();
		body.put("timestamp", Instant.now());
		body.put("status", ex.getStatusCode().value());
		body.put("erro", ex.getReason());

		return ResponseEntity.status(ex.getStatusCode()).body(body);
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<Map<String, Object>> handleIntegrityViolation(DataIntegrityViolationException ex) {
		log.warn("Violacao de integridade de dados", ex);

		Map<String, Object> body = new HashMap<>();
		body.put("timestamp", Instant.now());
		body.put("status", HttpStatus.CONFLICT.value());
		body.put("erro", "Conflito ao salvar os dados");

		return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
		log.error("Erro nao tratado", ex);

		Map<String, Object> body = new HashMap<>();
		body.put("timestamp", Instant.now());
		body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
		body.put("erro", "Erro interno no servidor");

		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
	}
}
