from app.main import app

for route in app.routes:
    if hasattr(route, "path") and "feedback" in route.path:
        print(f"Path: {route.path}, Methods: {getattr(route, 'methods', None)}, Name: {route.name}")
        import inspect
        if hasattr(route, "endpoint"):
            print("Source:")
            try:
                print(inspect.getsource(route.endpoint))
            except Exception as e:
                print("Could not get source:", e)
