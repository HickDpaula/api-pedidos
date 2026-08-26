package com.henrique.dev.pedidos_api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.henrique.dev.pedidos_api.domain.Pedido;
import com.henrique.dev.pedidos_api.domain.Usuario;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

	List<Pedido> findByUsuario(Usuario usuario);

	Optional<Pedido> findByIdAndUsuario(Long id, Usuario usuario);
}
