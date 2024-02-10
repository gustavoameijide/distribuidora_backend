CREATE TABLE perfiles(
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) UNIQUE NOT NULL,
    color VARCHAR(255),
    descripcion TEXT,
    categoria text,
    peso_neto_barra_6mts NUMBER,
    stock NUMBER,
    disponible TYPE BOOLEAN
);


CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email   VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE clientes(
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    email   VARCHAR(255) UNIQUE NOT NULL,
    telefono   VARCHAR,
    domicilio VARCHAR(255),
    localidad VARCHAR(255),
    provincia VARCHAR(255),
    dni VARCHAR,
    total_facturado NUMERIC,
    entrega NUMERIC,
    deuda_restante NUMERIC,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE presupuesto(
    id SERIAL PRIMARY KEY,
    clientes json,
    productos json,
    estadistica json,
    estado VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE facturacion(
    id SERIAL PRIMARY KEY,
    clientes json,
    productos json,
    estadisticas json,
    estado VARCHAR(255),
    tipo_factura VARCHAR(255),
    iva_total VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)


CREATE TABLE datos_facturacion(
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    detalle VARCHAR(255),
    telefono VARCHAR(255),
    direccion VARCHAR(255),
    localidad VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE categorias(
    id SERIAL PRIMARY KEY,
    categoria VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE colores(
    id SERIAL PRIMARY KEY,
    color VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

ALTER TABLE users ADD COLUMN gravatar VARCHAR(255);

ALTER TABLE perfiles ADD COLUMN user_id INTEGER REFERENCES users(id);

ALTER TABLE clientes ADD COLUMN user_id INTEGER REFERENCES users(id);

ALTER TABLE presupuesto ADD COLUMN user_id INTEGER REFERENCES users(id);

ALTER TABLE facturacion ADD COLUMN user_id INTEGER REFERENCES users(id);

ALTER TABLE datos_facturacion ADD COLUMN user_id INTEGER REFERENCES users(id);

ALTER TABLE categorias ADD COLUMN user_id INTEGER REFERENCES users(id);

ALTER TABLE colores ADD COLUMN user_id INTEGER REFERENCES users(id);