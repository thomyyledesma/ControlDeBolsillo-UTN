package com.finanzas.personales.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "meta_ahorro")
public class MetaAhorro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String nombre;

    @NotNull
    @DecimalMin(value = "0.01", message = "El monto objetivo debe ser mayor a cero")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal montoObjetivo;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal montoActual = BigDecimal.ZERO;

    private LocalDate fechaLimite;

    @Column(nullable = false)
    private Boolean cumplida = false;

    @Version
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cuenta_id")
    private Cuenta cuenta;



     public void depositar(BigDecimal monto){
         if(monto == null || monto.compareTo(BigDecimal.ZERO) <= 0) {
             throw new IllegalArgumentException("El monto a depositar debe ser mayor a cero");
         }
         if(this.cumplida){
             throw new IllegalStateException("La meta ya fue cumplida");
         }
         BigDecimal restante = this.montoObjetivo.subtract(this.montoActual);
         if(monto.compareTo(restante) > 0){
             throw new IllegalArgumentException(
                     "El depósito supera el objetivo. Para completar la meta solo falta " + restante);
         }
         this.montoActual = this.montoActual.add(monto);
         if(this.montoActual.compareTo(this.montoObjetivo) >= 0){
             this.cumplida = true;
         }
     }


     public void retirar(BigDecimal monto){
         if(monto == null || monto.compareTo(BigDecimal.ZERO) <= 0){
             throw new IllegalArgumentException("El monto a retirar debe ser mayor a cero");
         }
         if(monto.compareTo(this.montoActual) > 0) {
             throw new IllegalStateException("No hay suficiente saldo en la meta para retirar ese monto");
         }
         this.montoActual = this.montoActual.subtract(monto);

         if(this.cumplida && this.montoActual.compareTo(this.montoObjetivo) < 0){
             this.cumplida = false;
         }
     }
}
