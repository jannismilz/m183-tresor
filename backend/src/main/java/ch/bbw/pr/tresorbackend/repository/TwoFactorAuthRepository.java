package ch.bbw.pr.tresorbackend.repository;

import ch.bbw.pr.tresorbackend.model.TwoFactorAuth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TwoFactorAuthRepository extends JpaRepository<TwoFactorAuth, Long> {
    
    Optional<TwoFactorAuth> findByUserId(Long userId);
    
    boolean existsByUserId(Long userId);
}
