/** Average reqs/s across 5 scenarios: Plain Text, JSON, Path Params, POST JSON, DI + Service */
export const benchmarkResults = [
  {
    name: 'Elysia',
    runtime: 'Bun',
    reqsPerSec: 75_076,
    color: '#67e8f9',
    gradient: 'linear-gradient(90deg, #475569, #64748b)',
  },
  {
    name: 'Nestelia',
    runtime: 'Bun',
    reqsPerSec: 67_041,
    color: '#c084fc',
    gradient: 'linear-gradient(90deg, #7c3aed, #c084fc, #f472b6)',
  },
  {
    name: 'Fastify',
    runtime: 'Node',
    reqsPerSec: 42_883,
    color: '#fbbf24',
    gradient: 'linear-gradient(90deg, #4a4540, #78716c)',
  },
  {
    name: 'Express',
    runtime: 'Node',
    reqsPerSec: 37_996,
    color: '#86efac',
    gradient: 'linear-gradient(90deg, #3f4a3f, #6b7c6b)',
  },
  {
    name: 'NestJS',
    runtime: 'Node',
    reqsPerSec: 30_822,
    color: '#fca5a5',
    gradient: 'linear-gradient(90deg, #4a3f3f, #7c6b6b)',
  },
]
