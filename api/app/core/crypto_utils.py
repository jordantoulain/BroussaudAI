"""
Crypto Utilities for secure storage of sensitive data.
"""
import os
from cryptography.fernet import Fernet
from cryptography.fernet import InvalidToken
import logging

logger = logging.getLogger(__name__)


class CryptoUtils:
    """Utility class for encryption/decryption operations."""
    
    def __init__(self, key: str = None):
        """
        Initialize the crypto utilities.
        
        Args:
            key: Encryption key (base64 encoded). If None, uses MFA_ENCRYPTION_KEY from env.
        """
        if key is None:
            key = os.environ.get("MFA_ENCRYPTION_KEY")
        
        if not key:
            raise ValueError(
                "No encryption key provided and MFA_ENCRYPTION_KEY environment variable is not set. "
                "Please generate a key using: python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\"")
        
        try:
            self.cipher_suite = Fernet(key.encode())
        except Exception as e:
            logger.error(f"Failed to initialize cipher suite: {e}")
            raise ValueError(f"Invalid encryption key: {e}")
    
    def encrypt(self, plaintext: str) -> str:
        """
        Encrypt a string.
        
        Args:
            plaintext: The string to encrypt
            
        Returns:
            Base64 encoded encrypted string
        """
        if not plaintext:
            return plaintext
        
        try:
            encrypted = self.cipher_suite.encrypt(plaintext.encode())
            return encrypted.decode()
        except Exception as e:
            logger.error(f"Encryption failed: {e}")
            raise
    
    def decrypt(self, ciphertext: str) -> str:
        """
        Decrypt a string.
        
        Args:
            ciphertext: The encrypted string (base64 encoded)
            
        Returns:
            Decrypted string
            
        Raises:
            ValueError: If decryption fails
        """
        if not ciphertext:
            return ciphertext
        
        try:
            decrypted = self.cipher_suite.decrypt(ciphertext.encode())
            return decrypted.decode()
        except InvalidToken:
            logger.error("Decryption failed: Invalid token (possibly corrupted or wrong key)")
            raise ValueError("Decryption failed: Invalid or corrupted data")
        except Exception as e:
            logger.error(f"Decryption failed: {e}")
            raise ValueError(f"Decryption failed: {e}")


# Initialize MFA encryptor (lazy initialization to avoid circular imports)
_mfa_encryptor = None

def get_mfa_encryptor():
    """Get the MFA secret encryptor instance."""
    global _mfa_encryptor
    if _mfa_encryptor is None:
        _mfa_encryptor = CryptoUtils(os.environ.get("MFA_ENCRYPTION_KEY"))
    return _mfa_encryptor

def encrypt_mfa_secret(secret: str) -> str:
    """Encrypt a MFA secret for storage."""
    if not secret:
        return secret
    return get_mfa_encryptor().encrypt(secret)

def decrypt_mfa_secret(encrypted_secret: str) -> str:
    """Decrypt a MFA secret from storage."""
    if not encrypted_secret:
        return encrypted_secret
    return get_mfa_encryptor().decrypt(encrypted_secret)
