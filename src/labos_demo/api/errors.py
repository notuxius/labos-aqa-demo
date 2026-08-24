class LabOsApiError(RuntimeError):
    """Raised when communication with the LabOS API fails."""


class LabOsContractError(LabOsApiError):
    """Raised when an API response violates the expected contract."""
