from tests.factories.http_values import (
    build_api_token,
    build_request_id,
    build_text_body,
)


def test_http_value_factories_generate_unique_values() -> None:
    builders = (build_api_token, build_request_id, build_text_body)

    for build_value in builders:
        assert build_value() != build_value()
