import { baCharacter } from './ba'
import { devLeadCharacter } from './dev-lead'
import { devCharacter } from './dev'
import { testerCharacter } from './tester'
import { devopsCharacter } from './devops'
import type { AgentId, CharacterData } from '../types'

// dev-be reuses dev character with different display name
const devBeCharacter: CharacterData = { ...devCharacter, agentId: 'dev-be' as AgentId, displayName: 'Dev BE' }
// dev-fe: create a cyan-tinted variant of dev character
const devFeCharacter: CharacterData = {
  ...devCharacter,
  agentId: 'dev-fe' as AgentId,
  displayName: 'Dev FE',
  palette: [
    '#F5D0B5', // 0: skin light
    '#D4A574', // 1: skin shadow
    '#06B6D4', // 2: cyan main (was green)
    '#0891B2', // 3: dark cyan (was dark green)
    '#5B3A1A', // 4: hair brown
    '#FFFFFF', // 5: white
    '#374151', // 6: dark gray
    '#1F2937', // 7: glasses frame
    '#EF4444', // 8: red error
    '#000000', // 9: black
  ],
}

export const CHARACTER_MAP: Record<AgentId, CharacterData> = {
  'ba': baCharacter,
  'dev-lead': devLeadCharacter,
  'dev-be': devBeCharacter,
  'dev-fe': devFeCharacter,
  'tester': testerCharacter,
  'devops': devopsCharacter,
}

export type { AgentId, CharacterData }
