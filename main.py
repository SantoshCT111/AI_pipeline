from fastapi import FastAPI
from api.generate_route import router as generate_router

# 1. Initialize the Temple
app = FastAPI(
    title="London AI Pipeline",
    description="Backend for generating gamified educational tasks."
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