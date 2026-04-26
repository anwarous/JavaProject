package com.shopflow.service;

import com.shopflow.dto.request.Requests.*;
import com.shopflow.dto.response.Responses.*;
import com.shopflow.entity.*;
import com.shopflow.exception.Exceptions.*;
import com.shopflow.mapper.EntityMapper;
import com.shopflow.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final EntityMapper mapper;

    public List<AddressResponse> getUserAddresses(User user) {
        return addressRepository.findByUserId(user.getId()).stream()
                .map(mapper::toAddressResponse).collect(Collectors.toList());
    }

    @Transactional
    public AddressResponse addAddress(User user, AddressRequest request) {
        if (request.isPrimary()) {
            addressRepository.findByUserIdAndPrimaryTrue(user.getId())
                    .ifPresent(addr -> { addr.setPrimary(false); addressRepository.save(addr); });
        }
        Address address = Address.builder()
                .user(user)
                .street(request.getStreet())
                .city(request.getCity())
                .zipCode(request.getZipCode())
                .country(request.getCountry())
                .primary(request.isPrimary())
                .build();
        return mapper.toAddressResponse(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(User user, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));
        if (!address.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("This address does not belong to you");
        }
        addressRepository.delete(address);
    }
}
