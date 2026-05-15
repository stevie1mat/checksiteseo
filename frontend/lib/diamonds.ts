export const DEFAULT_TOKENS_PER_DIAMOND = 100

export function normalizeTokensPerDiamond(value: number | null | undefined): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_TOKENS_PER_DIAMOND
  return parsed
}

export function toDiamonds(tokens: number | null | undefined, tokensPerDiamond: number | null | undefined): number {
  const normalizedTokens = Number(tokens || 0)
  const divisor = normalizeTokensPerDiamond(tokensPerDiamond)
  return normalizedTokens / divisor
}

export function formatDiamonds(value: number | null | undefined): string {
  const amount = Number(value || 0)
  if (!Number.isFinite(amount)) return "0"

  if (Math.abs(amount) >= 100) {
    return amount.toLocaleString(undefined, { maximumFractionDigits: 1 })
  }
  if (Math.abs(amount) >= 10) {
    return amount.toLocaleString(undefined, { maximumFractionDigits: 2 })
  }
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
