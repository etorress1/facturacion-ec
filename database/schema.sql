-- =====================================================================
-- SISTEMA DE FACTURACIÓN, COTIZACIÓN Y GESTIÓN MULTI-NEGOCIO (ECUADOR)
-- Compatible con MySQL 8.x / MySQL Workbench
-- =====================================================================
-- Cómo usarlo en MySQL Workbench:
--   1. File > Open SQL Script... selecciona este archivo.
--   2. Ejecuta el script completo (rayo amarillo) sobre una conexión activa.
--   3. Para ver el diagrama EER: Database > Reverse Engineer... elige el
--      esquema "facturacion_ec" y Workbench generará el modelo visual.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS facturacion_ec
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE facturacion_ec;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================================
-- 1. EMPRESAS (NEGOCIOS) - Núcleo del sistema multi-tenant
-- =====================================================================
-- Cada fila = un negocio independiente que usa el sistema.
-- Todo lo demás cuelga de empresa_id, así se pueden operar varios
-- negocios dentro de la misma instalación/base de datos.
CREATE TABLE empresas (
    id                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ruc                     CHAR(13)        NOT NULL UNIQUE COMMENT 'RUC del negocio (13 dígitos)',
    razon_social            VARCHAR(300)    NOT NULL,
    nombre_comercial        VARCHAR(300)    NULL,
    direccion_matriz        VARCHAR(300)    NOT NULL,
    telefono                VARCHAR(20)     NULL,
    email                   VARCHAR(150)    NULL,
    logo_path               VARCHAR(300)    NULL,
    obligado_contabilidad   ENUM('SI','NO') NOT NULL DEFAULT 'NO',
    contribuyente_especial  VARCHAR(10)     NULL COMMENT 'Número de resolución si aplica, NULL si no lo es',
    agente_retencion        VARCHAR(10)     NULL COMMENT 'Número de resolución si es agente de retención',
    regimen                 ENUM('GENERAL','RIMPE_EMPRENDEDOR','RIMPE_NEGOCIO_POPULAR') NOT NULL DEFAULT 'GENERAL',
    ambiente_sri            ENUM('PRUEBAS','PRODUCCION') NOT NULL DEFAULT 'PRUEBAS' COMMENT 'Ambiente SRI: 1=Pruebas, 2=Producción',
    tipo_emision            ENUM('NORMAL','CONTINGENCIA') NOT NULL DEFAULT 'NORMAL',
    plan                    ENUM('LOCAL','CLOUD') NOT NULL DEFAULT 'LOCAL' COMMENT 'Modo de despliegue del negocio',
    activo                  TINYINT(1)      NOT NULL DEFAULT 1,
    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================================
-- 2. ESTABLECIMIENTOS Y PUNTOS DE EMISIÓN (requeridos por el SRI)
-- =====================================================================
CREATE TABLE establecimientos (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    empresa_id      INT UNSIGNED NOT NULL,
    codigo          CHAR(3)      NOT NULL COMMENT 'Código de 3 dígitos, ej. 001',
    nombre          VARCHAR(150) NOT NULL,
    direccion       VARCHAR(300) NOT NULL,
    activo          TINYINT(1)   NOT NULL DEFAULT 1,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_establecimiento_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    UNIQUE KEY uq_establecimiento (empresa_id, codigo)
) ENGINE=InnoDB;

CREATE TABLE puntos_emision (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    establecimiento_id  INT UNSIGNED NOT NULL,
    codigo              CHAR(3)      NOT NULL COMMENT 'Código de 3 dígitos, ej. 001',
    descripcion         VARCHAR(150) NOT NULL,
    activo              TINYINT(1)   NOT NULL DEFAULT 1,
    created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_puntoemision_establecimiento FOREIGN KEY (establecimiento_id) REFERENCES establecimientos(id) ON DELETE CASCADE,
    UNIQUE KEY uq_punto_emision (establecimiento_id, codigo)
) ENGINE=InnoDB;

-- Control de secuenciales por tipo de comprobante y punto de emisión
-- (obligatorio llevarlo correlativo y sin saltos para el SRI)
CREATE TABLE secuenciales (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    punto_emision_id    INT UNSIGNED NOT NULL,
    tipo_comprobante    ENUM('01','03','04','05','06','07') NOT NULL
        COMMENT '01 Factura, 03 Liquidación compra, 04 Nota crédito, 05 Nota débito, 06 Guía remisión, 07 Comprobante retención',
    secuencial_actual  BIGINT UNSIGNED NOT NULL DEFAULT 0,
    CONSTRAINT fk_secuencial_punto FOREIGN KEY (punto_emision_id) REFERENCES puntos_emision(id) ON DELETE CASCADE,
    UNIQUE KEY uq_secuencial (punto_emision_id, tipo_comprobante)
) ENGINE=InnoDB;

-- =====================================================================
-- 3. USUARIOS Y ROLES (super_admin, admin, trabajador)
-- =====================================================================
CREATE TABLE usuarios (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    empresa_id          INT UNSIGNED NULL COMMENT 'NULL solo para super_admin (gestiona todos los negocios)',
    establecimiento_id  INT UNSIGNED NULL COMMENT 'Sucursal a la que está asignado el trabajador',
    nombres             VARCHAR(150) NOT NULL,
    apellidos           VARCHAR(150) NOT NULL,
    email               VARCHAR(150) NOT NULL UNIQUE,
    password_hash       VARCHAR(255) NOT NULL,
    rol                 ENUM('super_admin','admin','trabajador') NOT NULL DEFAULT 'trabajador',
    activo              TINYINT(1)   NOT NULL DEFAULT 1,
    ultimo_login        DATETIME     NULL,
    created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    CONSTRAINT fk_usuario_establecimiento FOREIGN KEY (establecimiento_id) REFERENCES establecimientos(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================================
-- 4. CATÁLOGOS SRI
-- =====================================================================
CREATE TABLE formas_pago_sri (
    codigo      CHAR(2) PRIMARY KEY,
    descripcion VARCHAR(150) NOT NULL
) ENGINE=InnoDB;

INSERT INTO formas_pago_sri (codigo, descripcion) VALUES
('01','SIN UTILIZACION DEL SISTEMA FINANCIERO'),
('15','COMPENSACION DE DEUDAS'),
('16','TARJETA DE DEBITO'),
('17','DINERO ELECTRONICO'),
('18','TARJETA PREPAGO'),
('19','TARJETA DE CREDITO'),
('20','OTROS CON UTILIZACION DEL SISTEMA FINANCIERO'),
('21','ENDOSO DE TITULOS');

CREATE TABLE tipos_identificacion_sri (
    codigo      CHAR(2) PRIMARY KEY,
    descripcion VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

INSERT INTO tipos_identificacion_sri (codigo, descripcion) VALUES
('04','RUC'),
('05','CEDULA'),
('06','PASAPORTE'),
('07','CONSUMIDOR FINAL'),
('08','IDENTIFICACION DEL EXTERIOR');

-- =====================================================================
-- 5. CLIENTES Y PRODUCTOS/SERVICIOS (por negocio)
-- =====================================================================
CREATE TABLE clientes (
    id                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    empresa_id              INT UNSIGNED NOT NULL,
    tipo_identificacion     CHAR(2)      NOT NULL DEFAULT '05',
    identificacion          VARCHAR(20)  NOT NULL,
    razon_social            VARCHAR(300) NOT NULL,
    direccion               VARCHAR(300) NULL,
    telefono                VARCHAR(20)  NULL,
    email                   VARCHAR(150) NULL,
    activo                  TINYINT(1)   NOT NULL DEFAULT 1,
    created_at              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cliente_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    CONSTRAINT fk_cliente_tipoid FOREIGN KEY (tipo_identificacion) REFERENCES tipos_identificacion_sri(codigo),
    UNIQUE KEY uq_cliente (empresa_id, identificacion)
) ENGINE=InnoDB;

CREATE TABLE categorias_producto (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    empresa_id  INT UNSIGNED NOT NULL,
    nombre      VARCHAR(150) NOT NULL,
    CONSTRAINT fk_categoria_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE productos (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    empresa_id          INT UNSIGNED NOT NULL,
    categoria_id        INT UNSIGNED NULL,
    codigo_principal    VARCHAR(50)  NOT NULL,
    codigo_auxiliar     VARCHAR(50)  NULL,
    nombre              VARCHAR(250) NOT NULL,
    descripcion         TEXT         NULL,
    tipo                ENUM('BIEN','SERVICIO') NOT NULL DEFAULT 'BIEN',
    precio_unitario     DECIMAL(12,4) NOT NULL DEFAULT 0.0000,
    porcentaje_iva      DECIMAL(5,2)  NOT NULL DEFAULT 15.00 COMMENT 'Ej. 15.00, 0.00 (tarifa 0%)',
    unidad_medida       VARCHAR(20)   NULL DEFAULT 'UNIDAD',
    maneja_inventario   TINYINT(1)    NOT NULL DEFAULT 0,
    stock_actual        DECIMAL(12,2) NOT NULL DEFAULT 0,
    activo              TINYINT(1)    NOT NULL DEFAULT 1,
    created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_producto_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    CONSTRAINT fk_producto_categoria FOREIGN KEY (categoria_id) REFERENCES categorias_producto(id) ON DELETE SET NULL,
    UNIQUE KEY uq_producto (empresa_id, codigo_principal)
) ENGINE=InnoDB;

-- =====================================================================
-- 6. COTIZACIONES
-- =====================================================================
CREATE TABLE cotizaciones (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    empresa_id          INT UNSIGNED NOT NULL,
    establecimiento_id  INT UNSIGNED NOT NULL,
    cliente_id          INT UNSIGNED NOT NULL,
    usuario_id          INT UNSIGNED NOT NULL COMMENT 'Trabajador/admin que la generó',
    numero              VARCHAR(20)  NOT NULL COMMENT 'Correlativo interno, ej. COT-000123',
    fecha_emision       DATE         NOT NULL,
    fecha_validez       DATE         NULL,
    subtotal_0          DECIMAL(12,2) NOT NULL DEFAULT 0,
    subtotal_iva        DECIMAL(12,2) NOT NULL DEFAULT 0,
    descuento           DECIMAL(12,2) NOT NULL DEFAULT 0,
    valor_iva           DECIMAL(12,2) NOT NULL DEFAULT 0,
    total               DECIMAL(12,2) NOT NULL DEFAULT 0,
    estado              ENUM('BORRADOR','ENVIADA','ACEPTADA','RECHAZADA','CONVERTIDA','ANULADA') NOT NULL DEFAULT 'BORRADOR',
    observaciones       TEXT NULL,
    factura_id          INT UNSIGNED NULL COMMENT 'Se llena cuando se convierte a factura',
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cotizacion_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    CONSTRAINT fk_cotizacion_establecimiento FOREIGN KEY (establecimiento_id) REFERENCES establecimientos(id),
    CONSTRAINT fk_cotizacion_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    CONSTRAINT fk_cotizacion_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    UNIQUE KEY uq_cotizacion_numero (empresa_id, numero)
) ENGINE=InnoDB;

CREATE TABLE cotizacion_detalle (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cotizacion_id   INT UNSIGNED NOT NULL,
    producto_id     INT UNSIGNED NOT NULL,
    descripcion     VARCHAR(300) NOT NULL COMMENT 'Copia del nombre al momento de cotizar',
    cantidad        DECIMAL(12,2) NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(12,4) NOT NULL,
    descuento       DECIMAL(12,2) NOT NULL DEFAULT 0,
    porcentaje_iva  DECIMAL(5,2)  NOT NULL DEFAULT 15.00,
    subtotal        DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_cotdetalle_cotizacion FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id) ON DELETE CASCADE,
    CONSTRAINT fk_cotdetalle_producto FOREIGN KEY (producto_id) REFERENCES productos(id)
) ENGINE=InnoDB;

-- =====================================================================
-- 7. FACTURAS (comprobante electrónico tipo 01)
-- =====================================================================
CREATE TABLE facturas (
    id                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    empresa_id              INT UNSIGNED NOT NULL,
    establecimiento_id      INT UNSIGNED NOT NULL,
    punto_emision_id        INT UNSIGNED NOT NULL,
    cotizacion_id           INT UNSIGNED NULL,
    cliente_id              INT UNSIGNED NOT NULL,
    usuario_id              INT UNSIGNED NOT NULL,
    secuencial              CHAR(9)      NOT NULL COMMENT 'Correlativo SRI de 9 dígitos, ej. 000000123',
    fecha_emision           DATE         NOT NULL,
    subtotal_0              DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT 'Subtotal con tarifa 0%/exento',
    subtotal_iva            DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT 'Subtotal gravado con IVA',
    total_descuento         DECIMAL(12,2) NOT NULL DEFAULT 0,
    valor_iva               DECIMAL(12,2) NOT NULL DEFAULT 0,
    propina                 DECIMAL(12,2) NOT NULL DEFAULT 0,
    total                   DECIMAL(12,2) NOT NULL DEFAULT 0,
    forma_pago_codigo       CHAR(2)      NOT NULL DEFAULT '01',
    estado                  ENUM('BORRADOR','EMITIDA','ANULADA') NOT NULL DEFAULT 'BORRADOR',
    observaciones           TEXT NULL,
    created_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_factura_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    CONSTRAINT fk_factura_establecimiento FOREIGN KEY (establecimiento_id) REFERENCES establecimientos(id),
    CONSTRAINT fk_factura_puntoemision FOREIGN KEY (punto_emision_id) REFERENCES puntos_emision(id),
    CONSTRAINT fk_factura_cotizacion FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id) ON DELETE SET NULL,
    CONSTRAINT fk_factura_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    CONSTRAINT fk_factura_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_factura_formapago FOREIGN KEY (forma_pago_codigo) REFERENCES formas_pago_sri(codigo),
    UNIQUE KEY uq_factura_secuencial (punto_emision_id, secuencial)
) ENGINE=InnoDB;

CREATE TABLE factura_detalle (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    factura_id      INT UNSIGNED NOT NULL,
    producto_id     INT UNSIGNED NOT NULL,
    descripcion     VARCHAR(300) NOT NULL,
    cantidad        DECIMAL(12,2) NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(12,4) NOT NULL,
    descuento       DECIMAL(12,2) NOT NULL DEFAULT 0,
    porcentaje_iva  DECIMAL(5,2)  NOT NULL DEFAULT 15.00,
    valor_iva       DECIMAL(12,2) NOT NULL DEFAULT 0,
    subtotal        DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_facdetalle_factura FOREIGN KEY (factura_id) REFERENCES facturas(id) ON DELETE CASCADE,
    CONSTRAINT fk_facdetalle_producto FOREIGN KEY (producto_id) REFERENCES productos(id)
) ENGINE=InnoDB;

-- =====================================================================
-- 8. INTEGRACIÓN SRI - seguimiento del ciclo de vida electrónico
-- =====================================================================
-- Esta tabla es la pieza clave para "subir y actualizar" al SRI:
-- guarda la clave de acceso, el XML generado/firmado y la respuesta.
CREATE TABLE comprobantes_sri (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    factura_id          INT UNSIGNED NOT NULL UNIQUE,
    clave_acceso        CHAR(49)     NOT NULL UNIQUE,
    ambiente            ENUM('PRUEBAS','PRODUCCION') NOT NULL,
    tipo_emision        ENUM('NORMAL','CONTINGENCIA') NOT NULL DEFAULT 'NORMAL',
    estado              ENUM('GENERADO','FIRMADO','ENVIADO','RECIBIDA','AUTORIZADO','NO_AUTORIZADO','DEVUELTA','RECHAZADO','ERROR','NO_ELECTRONICO')
                        NOT NULL DEFAULT 'GENERADO',
    xml_generado        LONGTEXT NULL COMMENT 'XML sin firmar',
    xml_firmado         LONGTEXT NULL COMMENT 'XML firmado XAdES-BES, listo para enviar',
    xml_autorizado      LONGTEXT NULL COMMENT 'XML de respuesta de autorización del SRI',
    numero_autorizacion VARCHAR(49) NULL,
    fecha_autorizacion  DATETIME NULL,
    mensaje_error       TEXT NULL,
    intentos            INT UNSIGNED NOT NULL DEFAULT 0,
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_comprobante_factura FOREIGN KEY (factura_id) REFERENCES facturas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Metadatos del certificado de firma electrónica (el archivo .p12 y su
-- clave NUNCA se guardan en esta tabla ni en texto plano; solo referencia
-- a dónde vive el archivo protegido y su vigencia).
CREATE TABLE certificados_firma (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    empresa_id          INT UNSIGNED NOT NULL UNIQUE,
    proveedor           VARCHAR(100) NULL COMMENT 'Security Data, Uanataca, BCE, ANF AC, etc.',
    alias               VARCHAR(150) NULL,
    ruta_archivo        VARCHAR(300) NOT NULL COMMENT 'Ruta al .p12/.pfx, fuera del control de versiones',
    password_cifrado    VARCHAR(500) NOT NULL COMMENT 'Password del certificado cifrado con la clave maestra de la app',
    fecha_expiracion    DATE NOT NULL,
    activo              TINYINT(1) NOT NULL DEFAULT 1,
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_certificado_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 9. AUDITORÍA (trazabilidad de acciones de usuarios)
-- =====================================================================
CREATE TABLE auditoria (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    empresa_id      INT UNSIGNED NULL,
    usuario_id      INT UNSIGNED NULL,
    accion          VARCHAR(100) NOT NULL,
    tabla_afectada  VARCHAR(100) NULL,
    registro_id     INT UNSIGNED NULL,
    detalle         JSON NULL,
    ip_address      VARCHAR(45) NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_auditoria_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE SET NULL,
    CONSTRAINT fk_auditoria_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================================
-- ÍNDICES ADICIONALES DE RENDIMIENTO
-- =====================================================================
CREATE INDEX idx_facturas_empresa_fecha ON facturas(empresa_id, fecha_emision);
CREATE INDEX idx_cotizaciones_empresa_fecha ON cotizaciones(empresa_id, fecha_emision);
CREATE INDEX idx_clientes_empresa ON clientes(empresa_id);
CREATE INDEX idx_productos_empresa ON productos(empresa_id);
CREATE INDEX idx_comprobantes_estado ON comprobantes_sri(estado);

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- USUARIO INICIAL (super_admin) - password: "CambiarInmediatamente123!"
-- El hash se genera con bcrypt en backend/src/utils/seedSuperAdmin.js
-- No se inserta aquí a propósito: ejecuta `npm run seed` en /backend
-- para crear el super_admin con una contraseña que tú definas.
-- =====================================================================
