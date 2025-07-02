package ch.bbw.pr.tresorbackend.controller;

import ch.bbw.pr.tresorbackend.model.ConfigProperties;
import ch.bbw.pr.tresorbackend.model.EmailAdress;
import ch.bbw.pr.tresorbackend.model.LoginRequest;
import ch.bbw.pr.tresorbackend.model.RegisterUser;
import ch.bbw.pr.tresorbackend.model.User;
import ch.bbw.pr.tresorbackend.service.EmailTwoFactorService;
import ch.bbw.pr.tresorbackend.service.PasswordEncryptionService;
import ch.bbw.pr.tresorbackend.service.TurnstileService;
import ch.bbw.pr.tresorbackend.service.UserService;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import jakarta.servlet.http.HttpServletRequest;

/**
 * UserController
 * @author Peter Rutschmann
 */
@RestController
@AllArgsConstructor
@RequestMapping("api/users")
public class UserController {

   private UserService userService;
   private PasswordEncryptionService passwordService;
   private TurnstileService turnstileService;
   private final ConfigProperties configProperties;
   private static final Logger logger = LoggerFactory.getLogger(UserController.class);

   @Autowired
   public UserController(ConfigProperties configProperties, UserService userService,
                         PasswordEncryptionService passwordService,
                         TurnstileService turnstileService) {
      this.configProperties = configProperties;
      System.out.println("UserController.UserController: cross origin: " + configProperties.getOrigin());
      // Logging in the constructor
      logger.info("UserController initialized: " + configProperties.getOrigin());
      logger.debug("UserController.UserController: Cross Origin Config: {}", configProperties.getOrigin());
      this.userService = userService;
      this.passwordService = passwordService;
      this.turnstileService = turnstileService;
   }

   // build create User REST API
   @CrossOrigin(origins = "${CROSS_ORIGIN}")
   @PostMapping
   public ResponseEntity<String> createUser(@Valid @RequestBody RegisterUser registerUser, BindingResult bindingResult, HttpServletRequest request) {
      // Verify Turnstile token
      String remoteIp = request.getRemoteAddr();
      boolean turnstileVerified = turnstileService.verifyToken(registerUser.getTurnstileToken(), remoteIp);
      
      if (!turnstileVerified) {
         logger.warn("Registration failed: Invalid Turnstile verification");
         JsonObject obj = new JsonObject();
         obj.addProperty("message", "Security verification failed. Please try again.");
         String json = new Gson().toJson(obj);
         return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(json);
      }
      
      logger.info("UserController.createUser: Turnstile verification passed.");

      if (bindingResult.hasErrors()) {
         List<String> errors = bindingResult.getFieldErrors().stream()
               .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
               .collect(Collectors.toList());
         System.out.println("UserController.createUser " + errors);

         JsonArray arr = new JsonArray();
         errors.forEach(arr::add);
         JsonObject obj = new JsonObject();
         obj.add("message", arr);
         String json = new Gson().toJson(obj);

         System.out.println("UserController.createUser, validation fails: " + json);
         return ResponseEntity.badRequest().body(json);
      }
      System.out.println("UserController.createUser: input validation passed");

      // Additional password strength validation
      String password = registerUser.getPassword();
      String passwordRegex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]).{8,}$";
      
      if (password.length() < 8 || !password.matches(passwordRegex)) {
          logger.warn("Registration failed: Password does not meet strength requirements");
          JsonObject obj = new JsonObject();
          obj.addProperty("message", "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
          String json = new Gson().toJson(obj);
          return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(json);
      }
      
      // Validate password confirmation match
      if (!password.equals(registerUser.getPasswordConfirmation())) {
          logger.warn("Registration failed: Password and confirmation do not match");
          JsonObject obj = new JsonObject();
          obj.addProperty("message", "Password and password confirmation do not match.");
          String json = new Gson().toJson(obj);
          return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(json);
      }
      
      System.out.println("UserController.createUser, password validation passed");

      User user = new User(
            null,
            registerUser.getFirstName(),
            registerUser.getLastName(),
            registerUser.getEmail(),
            passwordService.hashPassword(registerUser.getPassword())
            );

      User savedUser = userService.createUser(user);
      System.out.println("UserController.createUser, user saved in db");
      JsonObject obj = new JsonObject();
      obj.addProperty("answer", "User Saved");
      String json = new Gson().toJson(obj);
      System.out.println("UserController.createUser " + json);
      return ResponseEntity.accepted().body(json);
   }

   // build get user by id REST API
   // http://localhost:8080/api/users/1
   @CrossOrigin(origins = "${CROSS_ORIGIN}")
   @GetMapping("{id}")
   public ResponseEntity<User> getUserById(@PathVariable("id") Long userId) {
      User user = userService.getUserById(userId);
      return new ResponseEntity<>(user, HttpStatus.OK);
   }

   // Build Get All Users REST API
   // http://localhost:8080/api/users
   @CrossOrigin(origins = "${CROSS_ORIGIN}")
   @GetMapping
   public ResponseEntity<List<User>> getAllUsers() {
      List<User> users = userService.getAllUsers();
      return new ResponseEntity<>(users, HttpStatus.OK);
   }

   // Build Update User REST API
   // http://localhost:8080/api/users/1
   @CrossOrigin(origins = "${CROSS_ORIGIN}")
   @PutMapping("{id}")
   public ResponseEntity<User> updateUser(@PathVariable("id") Long userId,
                                          @RequestBody User user) {
      user.setId(userId);
      User updatedUser = userService.updateUser(user);
      return new ResponseEntity<>(updatedUser, HttpStatus.OK);
   }

   // Build Delete User REST API
   @CrossOrigin(origins = "${CROSS_ORIGIN}")
   @DeleteMapping("{id}")
   public ResponseEntity<String> deleteUser(@PathVariable("id") Long userId) {
      userService.deleteUser(userId);
      return new ResponseEntity<>("User successfully deleted!", HttpStatus.OK);
   }

   @Autowired
   private EmailTwoFactorService emailTwoFactorService;

   @CrossOrigin(origins = "${CROSS_ORIGIN}")
   @PostMapping("/login")
   public ResponseEntity<String> login(@Valid @RequestBody LoginRequest loginRequest, BindingResult bindingResult, HttpServletRequest request) {
      // Verify Turnstile token
      String remoteIp = request.getRemoteAddr();
      boolean turnstileVerified = turnstileService.verifyToken(loginRequest.getTurnstileToken(), remoteIp);
      
      if (!turnstileVerified) {
         logger.warn("Login failed: Invalid Turnstile verification");
         JsonObject obj = new JsonObject();
         obj.addProperty("message", "Security verification failed. Please try again.");
         String json = new Gson().toJson(obj);
         return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(json);
      }
      // Input validation
      if (bindingResult.hasErrors()) {
         List<String> errors = bindingResult.getFieldErrors().stream()
               .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
               .collect(Collectors.toList());

         JsonArray arr = new JsonArray();
         errors.forEach(arr::add);
         JsonObject obj = new JsonObject();
         obj.add("message", arr);
         String json = new Gson().toJson(obj);

         logger.warn("Login validation failed: " + json);
         return ResponseEntity.badRequest().body(json);
      }

      // Find user by email
      User user = userService.findByEmail(loginRequest.getEmail());
      if (user == null) {
         JsonObject obj = new JsonObject();
         obj.addProperty("message", "Invalid credentials");
         String json = new Gson().toJson(obj);
         logger.warn("Login failed: User not found with email: " + loginRequest.getEmail());
         return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(json);
      }

      // Verify password
      if (!passwordService.verifyPassword(loginRequest.getPassword(), user.getPassword())) {
         JsonObject obj = new JsonObject();
         obj.addProperty("message", "Invalid credentials");
         String json = new Gson().toJson(obj);
         logger.warn("Login failed: Invalid password for user: " + loginRequest.getEmail());
         return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(json);
      }

      // Password is correct, now send 2FA code via email
      boolean codeSent = emailTwoFactorService.generateAndSendVerificationCode(user.getId());
      
      if (!codeSent) {
         JsonObject obj = new JsonObject();
         obj.addProperty("message", "Failed to send verification code");
         String json = new Gson().toJson(obj);
         logger.error("Failed to send 2FA code for user: " + loginRequest.getEmail());
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(json);
      }
      
      // Return success with 2FA required flag
      JsonObject obj = new JsonObject();
      obj.addProperty("message", "2FA verification required");
      obj.addProperty("userId", user.getId());
      obj.addProperty("requiresTwoFactor", true);
      String json = new Gson().toJson(obj);
      logger.info("Login credentials verified, 2FA required for user: " + loginRequest.getEmail());
      return ResponseEntity.ok(json);
   }

   // get user id by email
   @CrossOrigin(origins = "${CROSS_ORIGIN}")
   @PostMapping("/byemail")
   public ResponseEntity<String> getUserIdByEmail(@RequestBody EmailAdress email, BindingResult bindingResult) {
      System.out.println("UserController.getUserIdByEmail: " + email);
      if (bindingResult.hasErrors()) {
         List<String> errors = bindingResult.getFieldErrors().stream()
               .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
               .collect(Collectors.toList());
         System.out.println("UserController.createUser " + errors);

         JsonArray arr = new JsonArray();
         errors.forEach(arr::add);
         JsonObject obj = new JsonObject();
         obj.add("message", arr);
         String json = new Gson().toJson(obj);

         System.out.println("UserController.createUser, validation fails: " + json);

         return ResponseEntity.badRequest().body(json);
      }

      User user = userService.findByEmail(email.getEmail());
      if (user == null) {
         System.out.println("UserController.getUserIdByEmail, no user found with email: " + email);

         JsonObject obj = new JsonObject();
         obj.addProperty("message", "No user found with this email");
         String json = new Gson().toJson(obj);

         System.out.println("UserController.getUserIdByEmail, fails: " + json);

         return ResponseEntity.badRequest().body(json);
      }
      
      System.out.println("UserController.getUserIdByEmail, user find by email");

      JsonObject obj = new JsonObject();
      obj.addProperty("answer", user.getId());
      String json = new Gson().toJson(obj);

      System.out.println("UserController.getUserIdByEmail " + json);

      return ResponseEntity.accepted().body(json);
   }

}
