import os
from flask import Flask
from . import yolo
from flask_cors import CORS

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    
    app.register_blueprint(yolo.bp)
    CORS(app, origins="*")

    if test_config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass


    @app.route('/')
    def apifuncionando():
        return "A aplicação está em funcionamento 🚀"



    if __name__ == '__main__':
        app.run(debug=True)

    return app
