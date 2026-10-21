
import factory
from faker import Faker

fake = Faker("en_IN")


class RiderFactory(factory.DictFactory):
    id = factory.Sequence(lambda n: f"test-rider-{n:04d}")
    name = factory.LazyFunction(fake.name)
    email = factory.Sequence(lambda n: f"rider{n}@example.com")
    role = "rider"


class DriverFactory(factory.DictFactory):
    id = factory.Sequence(lambda n: f"test-driver-{n:04d}")
    name = factory.LazyFunction(fake.name)
    email = factory.Sequence(lambda n: f"driver{n}@example.com")
    role = "driver"
    is_available = True


class RideFactory(factory.DictFactory):
    id = factory.Sequence(lambda n: f"test-ride-{n:04d}")
    rider_id = factory.Sequence(lambda n: f"test-rider-{n:04d}")
    driver_id = None
    status = "requested"
    pickup_address = factory.LazyFunction(
        lambda: "MG Road, Bengaluru"
    )
    dropoff_address = factory.LazyFunction(
        lambda: "Indiranagar, Bengaluru"
    )
    distance_km = 5.0


class PaymentFactory(factory.DictFactory):
    id = factory.Sequence(lambda n: f"test-payment-{n:04d}")
    ride_id = factory.Sequence(lambda n: f"test-ride-{n:04d}")
    amount = "145.00"
    currency = "INR"
    status = "pending"
    provider = "stripe"


class ReviewFactory(factory.DictFactory):
    id = factory.Sequence(lambda n: f"test-review-{n:04d}")
    ride_id = factory.Sequence(lambda n: f"test-ride-{n:04d}")
    rating = 5
    comment = "Excellent ride."
