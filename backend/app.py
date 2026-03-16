import os

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import Mapped
from datetime import datetime, time
from enum import Enum

app = Flask(__name__)

# =========================
# Connect to PostgreSQL using DATABASE_URL from docker-compose
# =========================
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize SQLAlchemy with the Flask application
db = SQLAlchemy(app)


# =========================
# Models
# =========================
class SupportedDiet(Enum):
    HALAL = "HALAL"
    VEGAN = "VEGAN"
    VEGETARIAN = "VEGETARIAN"
    KOSHER = "KOSHER"
    ANY = "ANY"
    NONE = "NONE"

    def serialize(self):
        return self.name


class Weekday(Enum):
    SUNDAY = "SUNDAY"
    MONDAY = "MONDAY"
    TUESDAY = "TUESDAY"
    WEDNESDAY = "WEDNESDAY"
    THURSDAY = "THURSDAY"
    FRIDAY = "FRIDAY"
    SATURDAY = "SATURDAY"


class HourlyRangeStatus(Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    UNKNOWN = "UNKNOWN"


class Pantries(db.Model):
    __tablename__ = "pantries"

    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.Text, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    zip = db.Column(db.String(10), nullable=False)
    latitude = db.Column(db.Numeric(15, 13), nullable=False)
    longitude = db.Column(db.Numeric(15, 13), nullable=False)
    phone = db.Column(db.String(25))
    email = db.Column(db.String(255))
    eligibility = db.Column(db.ARRAY(db.String(10)))
    supported_diets = db.Column(db.ARRAY(db.Enum(SupportedDiet, name="supported_diet")))
    comments = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.now())

    def serialize(self):
        if self.supported_diets is not None:
            self.supported_diets = [x.serialize() for x in self.supported_diets]

        return {
            "id": self.id,
            "url": self.url,
            "name": self.name,
            "address": self.address,
            "city": self.city,
            "zip": self.zip,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "phone": self.phone,
            "email": self.email,
            "eligibility": self.eligibility,
            "supported_diets": self.supported_diets,
            "comments": self.comments,
            "created_at": self.created_at,
        }


class PantryHours(db.Model):
    __tablename__ = "pantry_hours"

    id = db.Column(db.Integer, primary_key=True)
    pantry_id = db.Column(
        db.Integer, db.ForeignKey("pantries.id", ondelete="CASCADE"), nullable=False
    )
    day_of_week = db.Column(db.Enum(Weekday, name="weekday"), nullable=False)
    status = db.Column(
        db.Enum(HourlyRangeStatus, name="hourly_range_status"), nullable=False
    )
    open_time = db.Column(db.Time)
    close_time = db.Column(db.Time)

    def serialize(self):
        # Convert times to readable 12-hr AM/PM times
        if self.open_time is not None:
            self.open_time = self.open_time.strftime("%-I:%M %p")
        if self.close_time is not None:
            self.close_time = self.close_time.strftime("%-I:%M %p")

        return {
            "id": self.id,
            "pantry_id": self.pantry_id,
            "day_of_week": self.day_of_week.name,
            "status": self.status.name,
            "open_time": self.open_time,
            "close_time": self.close_time,
        }


# =========================
# Routes
# =========================

# -------------------------
# GET /api/pantries
# -------------------------
@app.route("/api/pantries", methods=["GET"])
def get_pantries():
    zip_code = request.args.get("zip")
    city = request.args.get("city")
    supported_diet = request.args.get("supported_diet")  # comma-separated
    eligibility = request.args.get("eligibility")
    open_now = request.args.get("open_now", type=bool)

    query = db.select(Pantries).order_by(Pantries.id)
    if zip_code:
        query = query.filter_by(zip=zip_code)
    if city:
        query = query.filter_by(city=city)
    # if supported_diet:
    #     for diet in supported_diet:
    #         query = query.filter(Pantries.supported_diets.any(supported_diet))
    # if open_now: join PantryHours and filter by current time

    results = db.session.execute(query).scalars()
    results = [x.serialize() for x in results.all()]
    return jsonify(results)


# -------------------------
# GET /api/pantries/<id>
# -------------------------
@app.route("/api/pantries/<int:pantry_id>", methods=["GET"])
def get_pantry_by_id(pantry_id):
    pantry = db.get_or_404(Pantries, pantry_id)
    pantry = pantry.serialize()
    return jsonify(pantry)


# -------------------------
# GET /api/pantries/<id>/hours
# -------------------------
@app.route("/api/pantries/<int:pantry_id>/hours", methods=["GET"])
def get_pantry_hours(pantry_id):
    query = db.select(PantryHours).filter_by(pantry_id=pantry_id)
    hours = db.session.execute(query).scalars()
    hours = [h.serialize() for h in hours]
    return jsonify(hours)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
