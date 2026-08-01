package com.henrique.dev.pedidos_api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.henrique.dev.pedidos_api.domain.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

	Optional<Usuario> findByEmail(String email);

	boolean existsByEmail(String email);
}
