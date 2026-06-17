"""
Utility functions for agent services.
"""
import copy
import google.genai._transformers as transformers


def extract_json_from_response(text: str) -> str:
    """
    Extract JSON from a response text.
    
    Args:
        text: Response text potentially containing JSON
        
    Returns:
        Extracted JSON string or original text if no JSON found
    """
    start, end = text.find('{'), text.rfind('}')
    return text[start:end+1] if start != -1 and end != -1 else text


# ============================================================================
# GEMINI SCHEMA PATCH (LOCAL ONLY)
# Fix for Google GenAI schema transformation issues
# ============================================================================

original_t_schema = transformers.t_schema


def clean_gemini_schema(data):
    """
    Clean schema by removing problematic fields for Gemini.
    
    Args:
        data: Schema data (dict or list)
        
    Returns:
        Cleaned schema data
    """
    if isinstance(data, dict):
        data.pop("additionalProperties", None)
        data.pop("additional_properties", None)
        for value in data.values():
            clean_gemini_schema(value)
    elif isinstance(data, list):
        for item in data:
            clean_gemini_schema(item)
    return data


def patched_t_schema(client, schema):
    """
    Patched schema transformation function for Gemini.
    
    This function intercepts the schema transformation and cleans
    the schema before passing it to the original function.
    """
    if hasattr(schema, "model_json_schema"):
        schema_dict = schema.model_json_schema()
    elif hasattr(schema, "schema"):
        schema_dict = schema.schema()
    elif isinstance(schema, dict):
        schema_dict = copy.deepcopy(schema)
    else:
        return original_t_schema(client, schema)
    
    cleaned_schema = clean_gemini_schema(schema_dict)
    return original_t_schema(client, cleaned_schema)


# Apply the patch
transformers.t_schema = patched_t_schema
