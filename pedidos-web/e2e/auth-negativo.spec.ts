import { expect, test } from '@playwright/test'

test('login com senha errada mostra modal de falha', async ({ page }) => {
  const email = `e2e-negativo-${Date.now()}@teste.com`

  await page.goto('/')

  await page.getByRole('button', { name: 'Cadastro' }).click()
  await page.getByPlaceholder('Seu nome').fill('Usuario Teste')
  await page.getByPlaceholder('voce@email.com').fill(email)
  await page.getByPlaceholder('Mínimo 6 caracteres').fill('123456')
  await page.getByRole('button', { name: 'Cadastrar' }).click()

  await expect(page.getByText('Olá, Usuario Teste')).toBeVisible()

  await page.getByRole('button', { name: 'Sair' }).click()

  await page.getByPlaceholder('voce@email.com').fill(email)
  await page.getByPlaceholder('Mínimo 6 caracteres').fill('senha-errada')
  await page.getByRole('button', { name: 'Entrar' }).click()

  await expect(page.getByText('Falha no login')).toBeVisible()
  await expect(page.getByText('E-mail ou senha inválidos')).toBeVisible()
})
