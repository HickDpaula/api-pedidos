package com.henrique.dev.pedidos_api.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.henrique.dev.pedidos_api.domain.Pedido;
import com.henrique.dev.pedidos_api.domain.Usuario;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

	Page<Pedido> findByUsuario(Usuario usuario, Pageable pageable);

	Optional<Pedido> findByIdAndUsuario(Long id, Usuario usuario);
}
