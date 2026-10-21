
from io import BytesIO
from decimal import Decimal

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


def generate_receipt(ride: dict) -> bytes:
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)

    pdf.setTitle(f"Ride Receipt {ride.get('id', '')}")

    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(50, 790, "Cab Booking - Ride Receipt")

    pdf.setFont("Helvetica", 11)

    fields = [
        ("Receipt / Ride ID", str(ride.get("id", ""))),
        ("Date", str(ride.get("created_at", ""))),
        ("Pickup", str(ride.get("pickup_address", ""))),
        ("Destination", str(ride.get("destination_address", ""))),
        ("Status", str(ride.get("status", ""))),
        ("Fare", f"INR {Decimal(str(ride.get('fare', 0))):.2f}"),
    ]

    y = 745

    for label, value in fields:
        pdf.drawString(50, y, f"{label}: {value[:100]}")
        y -= 28

    pdf.showPage()
    pdf.save()

    return buffer.getvalue()
