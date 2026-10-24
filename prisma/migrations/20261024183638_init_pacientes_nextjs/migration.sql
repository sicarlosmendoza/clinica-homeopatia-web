-- CreateTable
CREATE TABLE "pacientes" (
    "id" UUID NOT NULL,
    "nombre_completo" VARCHAR(255) NOT NULL,
    "fecha_nacimiento" DATE NOT NULL,
    "sexo" VARCHAR(20) NOT NULL,
    "genero" VARCHAR(50),
    "escolaridad" VARCHAR(100),
    "ocupacion" VARCHAR(150),
    "estado_civil" VARCHAR(50),
    "fecha_registro" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);
