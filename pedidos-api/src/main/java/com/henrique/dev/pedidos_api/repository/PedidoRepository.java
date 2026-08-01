package com.henrique.dev.pedidos_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.henrique.dev.pedidos_api.domain.Pedido;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
}
