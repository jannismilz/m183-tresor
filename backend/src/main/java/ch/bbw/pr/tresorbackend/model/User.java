package ch.bbw.pr.tresorbackend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * User
 * @author Peter Rutschmann
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user")
public class User {
   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;

   @Column(nullable = false, name="first_name")
   private String firstName;

   @Column(nullable = false, name="last_name")
   private String lastName;

   @Column(nullable = false, unique = true)
   private String email;

   @Column(nullable = false)
   private String password;
   
   @Column(name = "two_factor_enabled")
   private Boolean twoFactorEnabled;
   
   @Column(name = "two_factor_secret")
   private String twoFactorSecret;
   
   @Column(name = "oauth_provider")
   private String oauthProvider;
   
   @Column(name = "oauth_id")
   private String oauthId;
   
   @Column(name = "role", nullable = false, columnDefinition = "varchar(10) default 'user'")
   private String role = "user";
}