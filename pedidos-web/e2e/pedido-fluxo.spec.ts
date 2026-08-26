import { expect, test } from '@playwright/test'

test('cadastro, criacao de pedido, avanco de status ate o historico, e persistencia apos novo login', async ({ page }) => {
  const email = `e2e-${Date.now()}@teste.com`
  const nome = 'Henrique E2E'

  await page.goto('/')

  await page.getByRole('button', { name: 'Cadastro' }).click()
  await page.getByPlaceholder('Seu nome').fill(nome)
  await page.getByPlaceholder('voce@email.com').fill(email)
  await page.getByPlaceholder('Mínimo 6 caracteres').fill('123456')
  await page.getByRole('button', { name: 'Cadastrar' }).click()

  await expect(page.getByText(`Olá, ${nome}`)).toBeVisible()

  await page.getByPlaceholder('Nome do cliente').fill('Maria Silva')
  await page.getByPlaceholder('Rua, número, bairro').fill('Rua das Flores, 100')
  await page.getByPlaceholder('Nome do item').fill('X-Burger')
  await page.getByRole('button', { name: 'Criar pedido' }).click()

  await expect(page.getByText('Pedido criado com sucesso!')).toBeVisible()
  const card = page.locator('li').filter({ hasText: 'Maria Silva' })
  await expect(page.getByText('Em andamento (1)')).toBeVisible()

  // Escopa ao <span> do StatusBadge — o texto tambem aparece como <option> no
  // select de status, e getByText sozinho bateria nos dois (strict mode error).
  await card.getByRole('combobox').selectOption('EM_PREPARO')
  await expect(card.locator('span').filter({ hasText: 'Em preparo' })).toBeVisible()

  await card.getByRole('combobox').selectOption('SAIU_PARA_ENTREGA')
  await expect(card.locator('span').filter({ hasText: 'Saiu para entrega' })).toBeVisible()

  await card.getByRole('combobox').selectOption('ENTREGUE')
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'Confirmar' }).click()

  await expect(page.getByText('Em andamento (0)')).toBeVisible()
  await page.getByText('Histórico (1)').click()
  await expect(card).toBeVisible()
  await expect(card.getByText('Entregue')).toBeVisible()

  await page.getByRole('button', { name: 'Sair' }).click()
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()

  await page.getByPlaceholder('voce@email.com').fill(email)
  await page.getByPlaceholder('Mínimo 6 caracteres').fill('123456')
  await page.getByRole('button', { name: 'Entrar' }).click()

  await expect(page.getByText(`Olá, ${nome}`)).toBeVisible()
  await page.getByText('Histórico (1)').click()
  await expect(page.getByText(/Maria Silva/)).toBeVisible()
})
