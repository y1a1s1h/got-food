from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import os
from datetime import datetime, time

app = Flask(__name__)

# =========================
# Connect to PostgreSQL using DATABASE_URL from docker-compose
# =========================
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# =========================
# Models
# =========================
class FoodPantry(db.Model):
    __tablename__ = "pantries"

    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.Text, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    zip = db.Column(db.String(10), nullable=False)
    phone = db.Column(db.String(25))
    email = db.Column(db.String(255))
    eligibility = db.Column(db.ARRAY(db.String(10)))
    supported_diets = db.Column(db.ARRAY(db.String(50)))
    comments = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class PantryHours(db.Model):
    __tablename__ = "pantry_hours"

    id = db.Column(db.Integer, primary_key=True)
    pantry_id = db.Column(db.Integer, db.ForeignKey("pantries.id", ondelete="CASCADE"), nullable=False)
    day_of_week = db.Column(db.String(10), nullable=False)  # Use enum if desired
    status = db.Column(db.String(10), nullable=False)
    open_time = db.Column(db.Time)
    close_time = db.Column(db.Time)

# =========================
# Routes
# =========================

@app.route("/")
def home():
    return "Got Food backend running with PostgreSQL 🚀"

# -------------------------
# GET /api/pantries
# TODO: Filter by query params: id, zip, city, supported_diet, open_now
# -------------------------
@app.route("/api/pantries", methods=["GET"])
def get_pantries():
    pantry_id = request.args.get("id", type=int)
    zip_code = request.args.get("zip")
    city = request.args.get("city")
    supported_diet = request.args.get("supported_diet")  # comma-separated
    open_now = request.args.get("open_now", type=bool)

    # TODO: Build dynamic query based on which filters exist
    # Example:
    # query = FoodPantry.query
    # if pantry_id: query = query.filter_by(id=pantry_id)
    # if zip_code: query = query.filter_by(zip=zip_code)
    # if city: query = query.filter_by(city=city)
    # if supported_diet: query = query.filter(FoodPantry.supported_diets.any(supported_diet))
    # if open_now: join PantryHours and filter by current time

    # TODO: Fetch data from DB
    pantries = [
        {
            "id": 1,
            "name": "Central Pantry",
            "address": "123 Main St",
            "city": "Richmond",
            "zip": "23220",
            "phone": "555-1234",
            "email": "info@pantry.org",
            "eligibility": ["23220", "23221"],
            "supported_diets": ["VEGAN", "HALAL"],
            "comments": "Closed on holidays",
            "created_at": datetime.utcnow().isoformat()
        }
    ]

    return jsonify(pantries)

# -------------------------
# GET /api/pantries/<id>
# TODO: Return a single pantry by ID
# -------------------------
@app.route("/api/pantries/<int:pantry_id>", methods=["GET"])
def get_pantry_by_id(pantry_id):
    # TODO: Fetch pantry from DB
    pantry = {
        "id": pantry_id,
        "name": "Central Pantry",
        "address": "123 Main St",
        "city": "Richmond",
        "zip": "23220",
        "phone": "555-1234",
        "email": "info@pantry.org",
        "eligibility": ["23220", "23221"],
        "supported_diets": ["VEGAN", "HALAL"],
        "comments": "Closed on holidays",
        "created_at": datetime.utcnow().isoformat()
    }
    # TODO: Return 404 if not found
    return jsonify(pantry)

# -------------------------
# GET /api/pantries/<id>/hours
# TODO: Return weekly hours for a pantry
# -------------------------
@app.route("/api/pantries/<int:pantry_id>/hours", methods=["GET"])
def get_pantry_hours(pantry_id):
    # TODO: Fetch pantry_hours from DB
    hours = [
        {
            "id": 10,
            "pantry_id": pantry_id,
            "day_of_week": "MONDAY",
            "status": "OPEN",
            "open_time": "09:00:00",
            "close_time": "17:00:00"
        },
        {
            "id": 11,
            "pantry_id": pantry_id,
            "day_of_week": "TUESDAY",
            "status": "CLOSED",
            "open_time": None,
            "close_time": None
        }
    ]
    return jsonify(hours)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)