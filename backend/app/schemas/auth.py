import re

from pydantic import BaseModel, Field, field_validator


PIN_PATTERN = re.compile(r"^\d{4}$")


class PinRequest(BaseModel):
    pin: str = Field(..., min_length=4, max_length=4)

    @field_validator("pin")
    @classmethod
    def validate_pin(cls, value: str) -> str:
        if not PIN_PATTERN.match(value):
            raise ValueError("PIN must be exactly 4 digits")
        return value


class RegisterResponse(BaseModel):
    user_id: str
    message: str


class LoginResponse(BaseModel):
    user_id: str
    session_token: str
