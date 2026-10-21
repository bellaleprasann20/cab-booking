
def test_payment_webhook_fixture_has_expected_fields():
    payload = {
        "id": "evt_test_001",
        "type": "payment_intent.succeeded",
        "data": {
            "object": {
                "id": "pi_test_001",
                "status": "succeeded",
            }
        },
    }

    assert payload["id"].startswith("evt_")
    assert payload["type"] == "payment_intent.succeeded"
    assert payload["data"]["object"]["status"] == "succeeded"


def test_webhook_event_identifier_is_present():
    event = {
        "id": "evt_test_002",
        "type": "payment_intent.payment_failed",
    }

    assert event.get("id")
    assert event.get("type")
