from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.generate_route import router as generate_router

# 1. Initialize the Temple
app = FastAPI(
    title="London AI Pipeline",
    description="Backend for generating gamified educational tasks."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Connect the Sub-Dojos!
# We can even add a prefix, so the URL becomes /api/v1/generate-quiz/
app.include_router(
    generate_router, 
    prefix="/api/v1", 
    tags=["Quiz Generation"]
)

# If you add user profiles later, you just do:
# app.include_router(users_router, prefix="/api/v1/users")