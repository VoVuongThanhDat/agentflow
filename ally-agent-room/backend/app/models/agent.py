"""Agent configuration model and default agent definitions."""

from dataclasses import dataclass, field


@dataclass
class AgentConfig:
    id: str                        # 'ba', 'dev-lead', 'dev-be', 'dev-fe', 'tester', 'devops'
    name: str                      # Display name: 'BA', 'Dev Lead', 'Dev BE', 'Dev FE', 'Tester', 'DevOps'
    model: str                     # 'opus' or 'sonnet'
    system_prompt: str             # Agent's instructions
    auto_approve_tools: list[str]  # Tools that don't need user approval
    color: str                     # Hex color for UI
    desk_position: tuple[int, int] # Isometric tile position


AGENT_CONFIGS: dict[str, AgentConfig] = {
    'ba': AgentConfig(
        id='ba',
        name='BA',
        model='opus',
        system_prompt=(
            'You are a Business Analyst (BA) for the Ally development system. '
            'You gather requirements from users and create OpenSpec planning artifacts. '
            'You ask clarifying questions and produce structured specs for the Dev Lead.'
        ),
        auto_approve_tools=['Read', 'Grep', 'Glob', 'Write', 'Edit'],
        color='#3B82F6',
        desk_position=(8, 1),
    ),
    'dev-lead': AgentConfig(
        id='dev-lead',
        name='Dev Lead',
        model='sonnet',
        system_prompt=(
            'You are the Dev Lead for the Ally development system. '
            'You convert specs into Beads epics and tasks with dependencies. '
            'You coordinate the development team and ensure tasks are self-contained.'
        ),
        auto_approve_tools=['Read', 'Grep', 'Glob', 'Bash'],
        color='#8B5CF6',
        desk_position=(11, 3),
    ),
    'dev-be': AgentConfig(
        id='dev-be',
        name='Dev BE',
        model='sonnet',
        system_prompt=(
            'You are a Backend Developer (Dev BE) for the Ally development system. '
            'You implement backend tasks using Python and FastAPI. '
            'You implement tasks one at a time, creating one branch per task. '
            'You follow existing code patterns and only modify files within the task scope.'
        ),
        auto_approve_tools=['Read', 'Write', 'Edit', 'Bash', 'Grep', 'Glob'],
        color='#10B981',
        desk_position=(11, 7),
    ),
    'dev-fe': AgentConfig(
        id='dev-fe',
        name='Dev FE',
        model='sonnet',
        system_prompt=(
            'You are a Frontend Developer (Dev FE) for the Ally development system. '
            'You implement frontend tasks using React and Vite. '
            'You implement tasks one at a time, creating one branch per task. '
            'You follow existing code patterns and only modify files within the task scope.'
        ),
        auto_approve_tools=['Read', 'Write', 'Edit', 'Bash', 'Grep', 'Glob'],
        color='#06B6D4',
        desk_position=(8, 9),
    ),
    'tester': AgentConfig(
        id='tester',
        name='Tester',
        model='sonnet',
        system_prompt=(
            'You are a Tester for the Ally development system. '
            'You validate completed work against specs and acceptance criteria. '
            'You report pass/fail status and block merges that do not meet requirements.'
        ),
        auto_approve_tools=['Read', 'Grep', 'Glob', 'Bash'],
        color='#F59E0B',
        desk_position=(5, 7),
    ),
    'devops': AgentConfig(
        id='devops',
        name='DevOps',
        model='sonnet',
        system_prompt=(
            'You are a DevOps engineer for the Ally development system. '
            'You create pull requests, push branches, and maintain Beads state. '
            'You handle all git and CI/CD operations after development is complete.'
        ),
        auto_approve_tools=['Read', 'Grep', 'Glob', 'Bash'],
        color='#EF4444',
        desk_position=(5, 3),
    ),
}
