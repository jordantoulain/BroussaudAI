"""
Prompt management for agent services.
"""
from pathlib import Path
from typing import Optional

from llama_index.core import PromptTemplate


class PromptManager:
    """Manages loading and caching of prompt templates from files."""
    
    def __init__(self, prompts_dir: Optional[Path] = None):
        """
        Initialize prompt manager.
        
        Args:
            prompts_dir: Directory containing prompt files. Defaults to services/prompts/
        """
        self.prompts_dir = prompts_dir or (Path(__file__).parent / "prompts")
        self._prompts: dict[str, str] = {}
    
    def load_prompt(self, name: str) -> str:
        """
        Load a prompt from file.
        
        Args:
            name: Name of the prompt file (without extension)
            
        Returns:
            Content of the prompt file
            
        Raises:
            FileNotFoundError: If prompt file does not exist
        """
        if name in self._prompts:
            return self._prompts[name]
        
        txt_path = self.prompts_dir / f"{name}.txt"
        if txt_path.exists():
            with open(txt_path, "r", encoding="utf-8") as f:
                self._prompts[name] = f.read()
            return self._prompts[name]
        
        raise FileNotFoundError(f"Prompt file not found: tried {txt_path}")
    
    def get_prompt_template(self, name: str = "qa_prompt") -> PromptTemplate:
        """
        Get a prompt template.
        
        Args:
            name: Name of the prompt template
            
        Returns:
            PromptTemplate instance
        """
        return PromptTemplate(self.load_prompt(name))
