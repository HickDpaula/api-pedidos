package com.henrique.dev.pedidos_api.pedido;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.henrique.dev.pedidos_api.pedido.dto.AtualizarStatusRequest;
import com.henrique.dev.pedidos_api.pedido.dto.CriarPedidoRequest;
import com.henrique.dev.pedidos_api.pedido.dto.PedidoResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

	private final PedidoService pedidoService;

	public PedidoController(PedidoService pedidoService) {
		this.pedidoService = pedidoService;
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public PedidoResponse criar(@Valid @RequestBody CriarPedidoRequest request) {
		return pedidoService.criar(request);
	}

	@GetMapping
	public List<PedidoResponse> listarTodos() {
		return pedidoService.listarTodos();
	}

	@GetMapping("/{id}")
	public PedidoResponse buscarPorId(@PathVariable Long id) {
		return pedidoService.buscarPorId(id);
	}

	@PutMapping("/{id}/status")
	public PedidoResponse atualizarStatus(
			@PathVariable Long id,
			@Valid @RequestBody AtualizarStatusRequest request) {
		return pedidoService.atualizarStatus(id, request);
	}
}
